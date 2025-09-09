import { getErrorObject } from '#helpers/error'
import { koboToNaira } from '#helpers/currency'
import PropertyPurchaseNotification from '#mails/property_purchase_notification'
import InspectionDetail from '#models/inspection_detail'
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
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'
import { nanoid } from 'nanoid'
import mail from '@adonisjs/mail/services/main'
import PaystackService from '#services/paystack'

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

  async store({ auth, response, request, logger }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const { reference, planId } = await request.validateUsing(
        vine.compile(
          vine.object({
            reference: vine.string().trim(),
            planId: vine.string().trim().optional(),
          })
        )
      )

      const paystackPaymentData = await PaymentService.verifyTransaction({
        provider: 'paystack',
        reference,
      })

      /**
       * Convert amount from kobo to naira using utility function
       * PayStack returns amounts in kobo (smallest currency unit)
       * e.g., ₦10,000 = 1,000,000 kobo
       * Database decimal fields have precision (15,2) to store naira amounts
       */
      const amountInNaira = paystackPaymentData?.amount
        ? koboToNaira(paystackPaymentData.amount)
        : 0

      // return paystackPaymentData

      const payment = await Payment.query().where('reference', reference).first()

      if (payment) {
        payment.status = 'SUCCESS'
        await payment.save()
      }

      if (planId && payment) {
        const plan = await Plan.query().where('id', planId).firstOrFail()

        await Transaction.create({
          userId: user.id,
          transactionType: 'SUBSCRIPTION',
          amount: amountInNaira,
          paymentId: payment.id,
          type: 'subscription',
          isVerified: true,
          status: 'SUCCESS',
          actualAmount: amountInNaira,
          date: DateTime.now().toISO(),
          currency: 'NGN',
          narration: `Subscription payment for subscription.`,
          providerStatus: 'success',
          provider: 'PAYSTACK',
          transactionTypeId: plan.id,
          reference,
          providerResponse: JSON.stringify(paystackPaymentData),
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
      } else {
        const meta = paystackPaymentData?.metadata

        console.log(meta, 'Meta Data from Paystack')

        if (meta?.type === 'inspection') {
          await Transaction.create({
            userId: user.id,
            transactionType: 'PROPERTY_INSPECTION',
            amount: amountInNaira,
            type: 'inspection',
            isVerified: true,
            status: 'SUCCESS',
            actualAmount: amountInNaira,
            date: DateTime.now().toISO(),
            currency: 'NGN',
            narration: `Inspection payment for subscription.`,
            providerStatus: 'success',
            provider: 'PAYSTACK',
            reference: 'INS-' + nanoid(),
            providerResponse: JSON.stringify(paystackPaymentData),
          })

          await InspectionDetail.create({
            inspectionAmount: amountInNaira,
            inspectionStatus: 'PENDING',
            userId: meta.userId,
            name: meta.fullName,
            email: meta.email,
            phoneNumber: meta.phoneNumber,
            propertyId: meta.propertyId,
          })

          if (!!meta.affiliateSlug) {
            const affliate = await User.query().where('slug', meta.affiliateSlug).firstOrFail()

            if (!amountInNaira) return

            const affiliateAmount = amountInNaira * 0.1 // 10% of the payment amount

            await Transaction.create({
              userId: affliate.id,
              transactionType: 'PROPERTY_INSPECTION',
              amount: affiliateAmount,
              type: 'inspection',
              isVerified: true,
              status: 'SUCCESS',
              actualAmount: affiliateAmount,
              date: DateTime.now().toISO(),
              currency: 'NGN',
              narration: `Affiliate payment for subscription.`,
              providerStatus: 'success',
              provider: 'PAYSTACK',
              reference: 'AFF-' + nanoid(),
              slug: meta.affiliateSlug,
              propertyId: meta.propertyId,
              providerResponse: JSON.stringify(paystackPaymentData),
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
        }

        if (meta?.type === 'property_purchase') {
          await Transaction.create({
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
            providerResponse: JSON.stringify(paystackPaymentData),
          })

          // Create property purchase record
          await PropertyPurchase.create({
            userId: user.id,
            propertyId: meta.propertyId,
            purchaseAmount: amountInNaira,
            currency: meta.currency || 'NGN',
            purchaseStatus: 'COMPLETED',
            transactionReference: reference,
            buyerName: meta.fullName,
            buyerEmail: meta.email,
            buyerPhone: meta.phoneNumber,
          })

          // Update property availability to sold
          await Property.query().where('id', meta.propertyId).update({ availability: 'sold' })

          const property = await Property.findOrFail(meta.propertyId)

          // Send purchase confirmation email
          await mail.send(
            new PropertyPurchaseNotification({
              buyerName: meta.fullName,
              buyerEmail: meta.email,
              propertyTitle: property.title,
              propertyAddress: property.address,
              purchaseAmount: amountInNaira,
              currency: meta.currency || 'NGN',
              transactionReference: reference,
              purchaseDate: DateTime.now().toFormat('dd/MM/yyyy'),
            })
          )

          if (!!meta.affiliateSlug) {
            const affliate = await User.query().where('slug', meta.affiliateSlug).firstOrFail()

            if (!amountInNaira) return

            const affiliateAmount = amountInNaira * 0.05 // 5% of the property purchase amount

            await Transaction.create({
              userId: affliate.id,
              transactionType: 'PROPERTY_PURCHASE',
              amount: affiliateAmount,
              type: 'property_purchase',
              isVerified: true,
              status: 'SUCCESS',
              actualAmount: affiliateAmount,
              date: DateTime.now().toISO(),
              currency: meta.currency || 'NGN',
              narration: `Affiliate commission for property purchase: ${meta.propertyTitle}`,
              providerStatus: 'success',
              provider: 'PAYSTACK',
              reference: 'AFF-PROP-' + nanoid(),
              slug: meta.affiliateSlug,
              propertyId: meta.propertyId,
              providerResponse: JSON.stringify(paystackPaymentData),
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
        }
      }

      // handle subscription payment
      logger.info(paystackPaymentData, 'Paystack Payment Data dd:')

      return response.ok({
        message: 'Transaction created successfully!',
        success: true,
        data: paystackPaymentData,
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
      let transactionMetadata: any = {
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
        default:
          return response.badRequest({
            success: false,
            message: 'Invalid transaction type',
          })
      }

      const config = {
        email: user.email,
        callbackUrl,
        amount: amount * 100, // Convert to kobo for Paystack
        metadata: transactionMetadata,
      }

      const paystackResponse = await PaystackService.initializeTransaction(config)
      logger.info(paystackResponse, 'Paystack Init Response')

      // Create a pending payment record
      const payment = await Payment.create({
        userId: user.id,
        reference: paystackResponse.data.reference,
        amount: amount,
        status: 'PENDING',
        provider: 'PAYSTACK',
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
      const { reference } = request.body()
      const user = auth.user!

      if (!reference) {
        return response.badRequest({
          success: false,
          message: 'Reference is required',
        })
      }

      const paystackResponse = await PaymentService.verifyTransaction({
        provider: 'paystack',
        reference,
      })

      logger.info(paystackResponse, 'Paystack Verification Response')

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

      const amountInNaira = paystackResponse.amount ? koboToNaira(paystackResponse.amount) : 0

      const payment = await Payment.query().where('reference', reference).first()

      if (payment) {
        payment.status = 'SUCCESS'
        payment.providerResponse = JSON.stringify(paystackResponse)
        await payment.save()
      }

      const existingTransaction = await Transaction.query().where('reference', reference).first()

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
      switch (meta.type) {
        case 'subscription':
          await this.handleSubscriptionTransaction(user, amountInNaira, payment, reference, paystackResponse, meta)
          break
        case 'inspection':
          await this.handleInspectionTransaction(user, amountInNaira, payment, reference, paystackResponse, meta)
          break
        case 'property_purchase':
          await this.handlePropertyPurchaseTransaction(user, amountInNaira, payment, reference, paystackResponse, meta)
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
        data: paystackResponse,
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
    meta: any
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
    payment: Payment | null,
    reference: string,
    paystackResponse: any,
    meta: any
  ) {
    await Transaction.create({
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
      providerResponse: JSON.stringify(paystackResponse),
    })

    await InspectionDetail.create({
      inspectionAmount: amountInNaira,
      inspectionStatus: 'PENDING',
      userId: meta.userId,
      name: meta.fullName,
      email: meta.email,
      phoneNumber: meta.phoneNumber,
      propertyId: meta.propertyId,
    })

    if (meta.affiliateSlug) {
      await this.handleAffiliateCommission(amountInNaira, meta, 'inspection', 0.1)
    }
  }

  private async handlePropertyPurchaseTransaction(
    user: User,
    amountInNaira: number,
    payment: Payment | null,
    reference: string,
    paystackResponse: any,
    meta: any
  ) {
    await Transaction.create({
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

    await PropertyPurchase.create({
      userId: user.id,
      propertyId: meta.propertyId,
      purchaseAmount: amountInNaira,
      currency: meta.currency || 'NGN',
      purchaseStatus: 'COMPLETED',
      transactionReference: reference,
      buyerName: meta.fullName,
      buyerEmail: meta.email,
      buyerPhone: meta.phoneNumber,
    })

    await Property.query().where('id', meta.propertyId).update({ availability: 'sold' })

    const property = await Property.findOrFail(meta.propertyId)

    await mail.send(
      new PropertyPurchaseNotification({
        buyerName: meta.fullName,
        buyerEmail: meta.email,
        propertyTitle: property.title,
        propertyAddress: property.address,
        purchaseAmount: amountInNaira,
        currency: meta.currency || 'NGN',
        transactionReference: reference,
        purchaseDate: DateTime.now().toFormat('dd/MM/yyyy'),
      })
    )

    if (meta.affiliateSlug) {
      await this.handleAffiliateCommission(amountInNaira, meta, 'property_purchase', 0.05)
    }
  }

  private async handleAffiliateCommission(
    amountInNaira: number,
    meta: any,
    type: 'inspection' | 'property_purchase',
    commissionRate: number
  ) {
    const affliate = await User.query().where('slug', meta.affiliateSlug).firstOrFail()

    const affiliateAmount = amountInNaira * commissionRate

    await Transaction.create({
      userId: affliate.id,
      transactionType: type === 'inspection' ? 'PROPERTY_INSPECTION' : 'PROPERTY_PURCHASE',
      amount: affiliateAmount,
      type: type,
      isVerified: true,
      status: 'SUCCESS',
      actualAmount: affiliateAmount,
      date: DateTime.now().toISO(),
      currency: 'NGN',
      narration: `Affiliate commission for ${type}: ${meta.propertyTitle || 'property'}`,
      providerStatus: 'success',
      provider: 'PAYSTACK',
      reference: 'AFF-' + nanoid(),
      slug: meta.affiliateSlug,
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
}