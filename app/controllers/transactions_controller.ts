import { getErrorObject } from '#helpers/error'
import Payment from '#models/payment'
import Plan from '#models/plan'
import Subscription from '#models/subscription'
import Transaction from '#models/transaction'
import PaymentService from '#services/payment'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

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
          .orderBy('createdAt', 'desc')
          .where('type', 'like', `%${type || ''}%`)
          .preload('user')
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
      const { id } = request.params()

      const transaction = await Transaction.query().where('id', id).firstOrFail()

      await bouncer.with('TransactionPolicy').authorize('view', transaction)

      return response.ok({
        message: 'Transaction fetched successfully!',
        transaction,
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }

  async store({ auth, response, request, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const { reference, planId } = await request.validateUsing(
        vine.compile(
          vine.object({
            reference: vine.string().trim(),
            planId: vine.string().trim(),
          })
        )
      )
      const user = auth.user!

      const paystackPaymentData = await PaymentService.verifyTransaction({
        provider: 'paystack',
        reference,
      })

      const payment = await Payment.query().where('reference', reference).firstOrFail()
      payment.status = 'SUCCESS'
      payment.save()

      const plan = await Plan.query().where('id', planId).firstOrFail()

      await Transaction.create({
        userId: user.id,
        transactionType: 'SUBSCRIPTION',
        amount: payment.amount,
        paymentId: payment.id,
        type: 'subscription',
        isVerified: true,
        status: 'SUCCESS',
        actualAmount: payment.amount,
        date: DateTime.now().toISO(),
        currency: 'NGN',
        narration: `Wallet payment for subscription.`,
        providerStatus: 'success',
        provider: 'PAYSTACK',
        transactionTypeId: plan.id,
        reference,
        providerResponse: JSON.stringify(paystackPaymentData),
      })

      Subscription.create({
        userId: user.id,
        planId: plan.id,
        startDate: DateTime.now().toISO(),
        endDate: DateTime.now().plus({ months: plan.duration }).toISO(),
        totalPrice: plan.price,
      })

      // handle subscription payment
      logger.info('Paystack Payment Data:', paystackPaymentData)

      return response.ok({
        message: 'Transaction fetched successfully!',
        success: true,
        data: paystackPaymentData,
      })
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }
}
