import { getErrorObject } from '#helpers/error'
import { koboToNaira } from '#helpers/currency'
import { calculateLoanDetails, parseLoanDuration } from '#helpers/loan'
import { AFFILIATE_COMMISSION_RATES } from '#constants/general'
import { CATEGORY_IDS } from '#database/seeders/Acategory_seeder'
import InspectionDetail from '#models/inspection_detail'
import Loan from '#models/loan'
import LoanRepayment from '#models/loan_repayment'
import Payment from '#models/payment'
import Plan from '#models/plan'
import Property from '#models/property'
import PropertyPurchase from '#models/property_purchase'
import Subscription from '#models/subscription'
import Transaction from '#models/transaction'
import User from '#models/user'
import Wallet from '#models/wallet'
import PaymentService from '#services/payment'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { nanoid } from 'nanoid'
import mail from '@adonisjs/mail/services/main'
import PropertyPurchaseNotification from '#mails/property_purchase_notification'
import PaystackService from '#services/paystack'
import { TransactionMetadata, PaystackMetadata } from '../interfaces/payment.js'
import frontendEmailService from '#services/frontend_email'

export default class TransactionsController {
  public async index({ auth, request, response, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      const { page, limit, type } = request.qs()
      const setLimit = limit || 10
      const user = auth.user!

      if (user.role === 'admin') {
        await bouncer.with('UserPolicy').authorize('isAdmin')
        const transactions = await Transaction.query()
          .preload('user', (userQuery) => userQuery.select('id', 'email')) // Preload only necessary columns
          .orderBy('createdAt', 'desc')
          .where('type', 'like', `%${type || ''}%`)
          .paginate(page || 1, setLimit)

        return response.ok({
          message: 'Transactions fetched successfully!',
          transactions,
        })
      }

      const transactions = await Transaction.query()
        .where('userId', user.id)
        .where('type', 'like', `%${type || ''}%`)
        .orderBy('createdAt', 'desc')
        .paginate(page || 1, setLimit)

      return response.ok({
        message: 'Transactions fetched successfully!',
        ...transactions.toJSON(),
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  public async show({ auth, request, response, bouncer }: HttpContext) {
    try {
      await auth.authenticate()
      const { reference } = request.params()

      const transaction = await Transaction.query()
        .where('reference', reference)
        .preload('invoice')
        .firstOrFail()

      await bouncer.with('TransactionPolicy').authorize('view', transaction)

      return response.ok({
        message: 'Transaction fetched successfully!',
        data: transaction,
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async checkIfUserHasActiveSub({ user, plan }: { user: User; plan: Plan }) {
    const activeSub = await Subscription.query()
      .where('userId', user.id)
      .where('planId', plan.id)
      .where('endDate', '>', DateTime.now().toISO())
      .first()

    // trying to subscribe to a plan that is already active

    if (activeSub) {
      throw {
        message: 'You already have an active subscription for this plan.',
        description: 'Please pick a different plan',
      }
    }
  }

  async initializeTransaction({ auth, response, request, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const { type, callbackUrl, amount, metadata } = request.body()
      const user = auth.user!

      if (!type || !amount) {
        return response.badRequest({
          success: false,
          message: 'Type and amount are required',
        })
      }

      // Prepare metadata based on transaction type
      let transactionMetadata: TransactionMetadata = {
        type,
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        ...metadata,
      }

      // Add type-specific metadata
      switch (type) {
        case 'subscription':
          if (!metadata?.planId) {
            return response.badRequest({
              success: false,
              message: 'Plan ID is required for subscription',
            })
          }
          transactionMetadata.planId = metadata.planId
          break
        case 'inspection':
          if (!metadata?.propertyId) {
            return response.badRequest({
              success: false,
              message: 'Property ID is required for inspection',
            })
          }
          transactionMetadata.propertyId = metadata.propertyId
          break
        case 'property_purchase':
          if (!metadata?.propertyId || !metadata?.propertyTitle) {
            return response.badRequest({
              success: false,
              message: 'Property ID and title are required for property purchase',
            })
          }
          transactionMetadata.propertyId = metadata.propertyId
          transactionMetadata.propertyTitle = metadata.propertyTitle
          transactionMetadata.currency = metadata.currency || 'NGN'
          break
        case 'loan_repayment':
          if (!metadata?.loanId) {
            return response.badRequest({
              success: false,
              message: 'Loan ID is required for loan repayment',
            })
          }
          transactionMetadata.loanId = metadata.loanId
          transactionMetadata.repaymentAmount = metadata.repaymentAmount
          transactionMetadata.repaymentType = metadata.repaymentType || 'FULL'
          break
        default:
          return response.badRequest({
            success: false,
            message: 'Invalid transaction type',
          })
      }

      const config = {
        email: user.email,
        callbackUrl,
        amount: amount,
        metadata: transactionMetadata,
      }

      const paystackResponse = await PaystackService.initializeTransaction(config)
      logger.info(paystackResponse, 'Paystack Init Response')

      if (!paystackResponse || !paystackResponse.data) {
        return response.badRequest({
          success: false,
          message: 'Failed to initialize transaction with payment provider',
        })
      }

      // Create a pending payment record
      const payment = await Payment.create({
        userId: user.id,
        reference: paystackResponse.data.reference,
        amount: amount,
        status: 'PENDING',
        provider: 'PAYSTACK',
        paymentMethod: 'CARD',
        providerResponse: JSON.stringify(transactionMetadata),
      })

      return response.ok({
        success: true,
        message: 'Transaction initialized successfully',
        data: {
          ...paystackResponse.data,
          paymentId: payment.id,
        },
      })
    } catch (error) {
      logger.error(error)
      return response.badRequest(getErrorObject(error))
    }
  }

  async verifyTransaction({ auth, response, request, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const { reference, paymentReference } = request.body()
      const user = auth.user!

      // Use paymentReference if provided, otherwise use reference
      const paymentRef = paymentReference || reference

      if (!paymentRef) {
        return response.badRequest({
          success: false,
          message: 'Reference is required',
        })
      }

      const paystackResponse = await PaymentService.verifyTransaction({
        provider: 'paystack',
        reference: paymentRef,
      })

      logger.info('Paystack Verification Response', paystackResponse)

      if (!paystackResponse) {
        return response.badRequest({
          success: false,
          message: 'Transaction not found',
        })
      }

      if (paystackResponse.status !== 'success') {
        return response.badRequest({
          success: false,
          message: 'Transaction not successful',
        })
      }

      const amountInNaira = koboToNaira(paystackResponse.amount) || 0

      const payment = await Payment.query().where('reference', paymentRef).first()

      if (payment) {
        payment.status = 'SUCCESS'
        payment.providerResponse = JSON.stringify(paystackResponse)
        await payment.save()
      }

      const existingTransaction = await Transaction.query().where('reference', paymentRef).first()

      if (existingTransaction) {
        return response.ok({
          success: true,
          message: 'Transaction already processed',
          data: existingTransaction,
        })
      }

      // Get metadata from Paystack response
      const meta = paystackResponse.metadata

      if (!meta || !meta.type) {
        return response.badRequest({
          success: false,
          message: 'Transaction metadata not found',
        })
      }

      // Handle different transaction types
      let transactionData: any = null

      switch (meta.type) {
        case 'subscription':
          transactionData = await this.handleSubscriptionTransaction(
            user,
            amountInNaira,
            payment,
            paymentRef,
            paystackResponse,
            meta
          )
          break
        case 'inspection':
          transactionData = await this.handleInspectionTransaction(
            user,
            amountInNaira,
            payment,
            paymentRef,
            paystackResponse,
            meta
          )
          break
        case 'property_purchase':
          transactionData = await this.handlePropertyPurchaseTransaction(
            user,
            amountInNaira,
            payment,
            paymentRef,
            paystackResponse,
            meta
          )
          break
        case 'loan_repayment':
          transactionData = await this.handleLoanRepaymentTransaction(
            user,
            amountInNaira,
            payment,
            paymentRef,
            paystackResponse,
            meta
          )
          break
        default:
          return response.badRequest({
            success: false,
            message: 'Invalid transaction type',
          })
      }

      return response.ok({
        message: 'Transaction verified and processed successfully!',
        success: true,
        data: {
          ...paystackResponse,
          transactionData,
          type: meta.type,
        },
      })
    } catch (error) {
      logger.error(error)
      return response.badRequest(getErrorObject(error))
    }
  }

  private async handleSubscriptionTransaction(
    user: User,
    amountInNaira: number,
    payment: Payment | null,
    reference: string,
    paystackResponse: any,
    meta: PaystackMetadata
  ) {
    const plan = await Plan.query().where('id', meta.planId).firstOrFail()

    await Transaction.create({
      userId: user.id,
      transactionType: 'SUBSCRIPTION',
      amount: amountInNaira,
      paymentId: payment?.id,
      type: 'subscription',
      isVerified: true,
      status: 'SUCCESS',
      actualAmount: amountInNaira,
      date: DateTime.now().toISO(),
      currency: 'NGN',
      narration: `Subscription payment for ${plan.name}.`,
      providerStatus: 'success',
      provider: 'PAYSTACK',
      transactionTypeId: plan.id,
      reference,
      providerResponse: JSON.stringify(paystackResponse),
    })

    const sub = await Subscription.create({
      userId: user.id,
      planId: plan.id,
      startDate: DateTime.now().toISO(),
      endDate: DateTime.now().plus({ months: plan.duration }).toISO(),
      totalPrice: plan.price,
    })

    user.subscriptionId = sub.id
    user.subscriptionStatus = 'active'
    user.subscriptionEndDate = sub.endDate
    user.subscriptionStartDate = sub.startDate
    await user.save()
  }

  private async handleInspectionTransaction(
    user: User,
    amountInNaira: number,
    _payment: Payment | null,
    _reference: string,
    paystackResponse: any,
    meta: PaystackMetadata
  ) {
    const transaction = await Transaction.create({
      userId: user.id,
      transactionType: 'PROPERTY_INSPECTION',
      amount: amountInNaira,
      type: 'inspection',
      isVerified: true,
      status: 'SUCCESS',
      actualAmount: amountInNaira,
      date: DateTime.now().toISO(),
      currency: 'NGN',
      narration: `Inspection payment for property.`,
      providerStatus: 'success',
      provider: 'PAYSTACK',
      reference: 'INS-' + nanoid(),
      transactionTypeId: meta.propertyId,
      providerResponse: JSON.stringify(paystackResponse),
    })

    const inspection = await InspectionDetail.create({
      inspectionAmount: amountInNaira,
      inspectionStatus: 'PENDING',
      userId: meta.userId,
      name: meta.fullName,
      email: meta.email,
      phoneNumber: meta.phoneNumber,
      propertyId: meta.propertyId,
    })

    const property = await Property.findOrFail(meta.propertyId)

    return {
      transaction,
      inspection,
      property,
    }
  }

  private async handlePropertyPurchaseTransaction(
    user: User,
    amountInNaira: number,
    _payment: Payment | null,
    _reference: string,
    paystackResponse: any,
    meta: PaystackMetadata
  ) {
    const transaction = await Transaction.create({
      userId: user.id,
      transactionType: 'PROPERTY_PURCHASE',
      amount: amountInNaira,
      type: 'property_purchase',
      isVerified: true,
      status: 'SUCCESS',
      actualAmount: amountInNaira,
      date: DateTime.now().toISO(),
      currency: meta.currency || 'NGN',
      narration: `Property purchase: ${meta.propertyTitle}`,
      providerStatus: 'success',
      provider: 'PAYSTACK',
      reference: 'PROP-' + nanoid(),
      transactionTypeId: meta.propertyId,
      providerResponse: JSON.stringify(paystackResponse),
    })

    const purchase = await PropertyPurchase.create({
      userId: user.id,
      propertyId: meta.propertyId,
      purchaseAmount: amountInNaira,
      currency: meta.currency || 'NGN',
      purchaseStatus: 'COMPLETED',
      transactionReference: paystackResponse.reference,
      buyerName: meta.fullName,
      buyerEmail: meta.email,
      buyerPhone: meta.phoneNumber,
    })

    await Property.query().where('id', meta.propertyId).update({ availability: 'sold' })

    const property = await Property.findOrFail(meta.propertyId)

    const emailSent = await frontendEmailService.sendPropertyPurchaseEmail(meta.email, {
      buyerName: meta.fullName,
      propertyTitle: property.title,
      propertyAddress: property.address,
      purchaseAmount: amountInNaira,
      currency: meta.currency || 'NGN',
      transactionReference: transaction.reference,
      purchaseDate: DateTime.now().toFormat('dd/MM/yyyy'),
    })

    if (!emailSent) {
      await mail.send(
        new PropertyPurchaseNotification({
          buyerName: meta.fullName,
          buyerEmail: meta.email,
          propertyTitle: property.title,
          propertyAddress: property.address,
          purchaseAmount: amountInNaira,
          currency: meta.currency || 'NGN',
          transactionReference: transaction.reference,
          purchaseDate: DateTime.now().toFormat('dd/MM/yyyy'),
        })
      )
    }

    if (meta.affiliateId) {
      const commissionRate =
        property.categoryId === CATEGORY_IDS.SALE
          ? AFFILIATE_COMMISSION_RATES.SALE
          : AFFILIATE_COMMISSION_RATES.RENT_SHORTLET
      await this.handleAffiliateCommission(amountInNaira, meta, 'property_purchase', commissionRate)
    }

    return {
      transaction,
      purchase,
      property,
    }
  }

  private async handleAffiliateCommission(
    amountInNaira: number,
    meta: PaystackMetadata,
    type: 'property_purchase',
    commissionRate: number
  ) {
    const affliate = await User.query().where('id', meta.affiliateId).firstOrFail()

    const affiliateAmount = amountInNaira * commissionRate

    await Transaction.create({
      userId: affliate.id,
      transactionType: 'PROPERTY_PURCHASE',
      amount: affiliateAmount,
      type: type,
      isVerified: true,
      status: 'SUCCESS',
      actualAmount: affiliateAmount,
      date: DateTime.now().toISO(),
      currency: 'NGN',
      narration: `Affiliate commission for ${type === 'property_purchase' ? 'property purchase' : 'property'}`,
      providerStatus: 'success',
      provider: 'PAYSTACK',
      reference: 'AFF-' + nanoid(),
      propertyId: meta.propertyId,
      providerResponse: JSON.stringify({ commission: true }),
    })

    let wallet = await Wallet.query()
      .where('userId', affliate.id)
      .where('type', 'affiliate')
      .first()

    if (!wallet) {
      await Wallet.create({
        userId: affliate.id,
        type: 'affiliate',
      })
    }

    await Wallet.query()
      .where('userId', affliate.id)
      .where('type', 'affiliate')
      .increment('balance', affiliateAmount)
      .increment('totalBalance', affiliateAmount)
  }

  private async handleLoanRepaymentTransaction(
    user: User,
    amountInNaira: number,
    payment: Payment | null,
    reference: string,
    paystackResponse: any,
    meta: PaystackMetadata
  ) {
    const loan = await Loan.query().where('id', meta.loanId).firstOrFail()

    await Transaction.create({
      userId: user.id,
      transactionType: 'LOAN_REPAYMENT',
      amount: amountInNaira,
      paymentId: payment?.id,
      type: 'loan_repayment',
      isVerified: true,
      status: 'SUCCESS',
      actualAmount: amountInNaira,
      date: DateTime.now().toISO(),
      currency: 'NGN',
      narration: `Loan repayment for loan ${loan.id}`,
      providerStatus: 'success',
      provider: 'PAYSTACK',
      transactionTypeId: loan.id,
      reference,
      providerResponse: JSON.stringify(paystackResponse),
    })

    // Create loan repayment record
    const loanRepayment = await LoanRepayment.create({
      loanId: loan.id,
      userId: user.id,
      repaymentAmount: amountInNaira,
      repaymentType: meta.repaymentType || 'FULL',
      paymentMethod: 'CARD',
      paymentReference: reference,
      paymentProvider: 'PAYSTACK',
      repaymentStatus: 'SUCCESS',
      outstandingBalance: 0, // Will be calculated
      principalAmount: 0, // Will be calculated
      interestAmount: 0, // Will be calculated
      repaymentDate: DateTime.now(),
    })

    // Calculate principal and interest breakdown
    const loanAmount = parseFloat(loan.loanAmount)
    const loanDetails = calculateLoanDetails(
      loanAmount,
      loan.interestRate,
      parseLoanDuration(loan.loanDuration)
    )
    const totalInterest = loanDetails.totalInterest
    const totalPrincipal = loanAmount

    // Simple proportional calculation for principal/interest breakdown
    const interestPortion = totalInterest / loanDetails.totalAmount
    const principalPortion = totalPrincipal / loanDetails.totalAmount

    loanRepayment.interestAmount = amountInNaira * interestPortion
    loanRepayment.principalAmount = amountInNaira * principalPortion

    await loanRepayment.save()

    // Check if loan is fully repaid
    const allRepayments = await LoanRepayment.query()
      .where('loanId', loan.id)
      .where('repaymentStatus', 'SUCCESS')

    const totalPaid = allRepayments.reduce((sum, repayment) => sum + repayment.repaymentAmount, 0)
    const totalDue = loanDetails.totalAmount

    if (totalPaid >= totalDue) {
      loan.loanStatus = 'completed'
      await loan.save()
    }
  }

  async refundTransaction({ auth, response, request, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const { reference, amount, customerNote, merchantNote } = request.body()
      const user = auth.user!

      if (!reference) {
        return response.badRequest({
          success: false,
          message: 'Transaction reference is required',
        })
      }

      // Find the transaction
      const transaction = await Transaction.query()
        .where('reference', reference)
        .where('userId', user.id)
        .first()

      if (!transaction) {
        return response.badRequest({
          success: false,
          message: 'Transaction not found',
        })
      }

      // Check if transaction can be refunded (must be successful and not already refunded)
      if (transaction.status !== 'SUCCESS') {
        return response.badRequest({
          success: false,
          message: 'Only successful transactions can be refunded',
        })
      }

      const existingRefund = await Transaction.query()
        .where('reference', `REFUND-${reference}`)
        .first()

      if (existingRefund) {
        return response.badRequest({
          success: false,
          message: 'Transaction has already been refunded',
        })
      }

      const refundResponse = await PaystackService.refundTransaction(reference, {
        amount: amount ? amount : undefined,
        customer_note: customerNote,
        merchant_note: merchantNote,
      })

      if (!refundResponse) {
        return response.badRequest({
          success: false,
          message: 'Failed to process refund',
        })
      }

      const refundAmount = amount || transaction.amount

      await Transaction.create({
        userId: user.id,
        transactionType: 'REFUND',
        amount: -Math.abs(refundAmount), // Negative amount for refund
        type: 'wallet:credit', // Refund goes back to wallet
        isVerified: true,
        status: 'SUCCESS',
        actualAmount: -Math.abs(refundAmount),
        date: DateTime.now().toISO(),
        currency: transaction.currency,
        narration: `Refund for transaction ${reference}`,
        providerStatus: refundResponse.data.status,
        provider: 'PAYSTACK',
        reference: `REFUND-${reference}`,
        providerResponse: JSON.stringify(refundResponse),
      })

      // Update original transaction status
      transaction.status = 'REFUNDED'
      await transaction.save()

      return response.ok({
        success: true,
        message: 'Refund processed successfully',
        data: {
          refundReference: `REFUND-${reference}`,
          amount: refundAmount,
          status: refundResponse.data.status,
        },
      })
    } catch (error) {
      logger.error(error)
      return response.badRequest(getErrorObject(error))
    }
  }
}
