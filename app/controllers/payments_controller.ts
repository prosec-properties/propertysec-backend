import { getErrorObject } from '#helpers/error'
import { getDiscountAmount, getPaystackAmount, getPaystackAmountFee } from '#helpers/payment'
import { PaymentCredentials } from '#interfaces/payment'
import Payment from '#models/payment'
import Plan from '#models/plan'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import { nanoid } from 'nanoid'

export default class PaymentsController {
  async initializeSubscriptionPayment({ auth, request, response, logger }: HttpContext) {
    console.log('hiii')
    try {
      await auth.authenticate()
      const { planId, type } = await request.all()
      const user = auth.user!
      const plan = await Plan.findByOrFail('id', planId)

      console.log('Payload :', { planId, type })

      const generatedReference = nanoid(10)

      let responseObj: PaymentCredentials = {
        ...{
          message: 'Payment credentials fetched successfully!',
          isPaid: false,
          amountToPay: getDiscountAmount(plan.price, plan.discountPercentage),
          discountPercentage: plan.discountPercentage,
          actualTotalAmount: plan.price,
          reference: generatedReference,
        },
      }

      if (type === 'paystack') {
        const amount = getPaystackAmount(responseObj.amountToPay)
        const fee = getPaystackAmountFee(responseObj.amountToPay)

        responseObj = {
          ...responseObj,
          paystackConfig: {
            publicKey: env.get('PAYSTACK_PUBLIC_KEY')!,
            amount,
            email: user.email,
            label: user.fullName,
            channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
            metadata: {
              planId: plan.id,
              type: 'subscription',
              amount,
              fee,
              custom_fields: [
                {
                  value: plan.name,
                  display_name: 'Subscription',
                  variable_name: 'subscription',
                },
                {
                  value: plan.name,
                  display_name: 'Plan',
                  variable_name: 'plan',
                },
                {
                  value: plan.duration,
                  display_name: 'Duration',
                  variable_name: 'duration',
                },
                {
                  value: responseObj.amountToPay,
                  display_name: 'Amount',
                  variable_name: 'amount',
                },
                {
                  value: fee,
                  display_name: 'Fee',
                  variable_name: 'fee',
                },
              ],
            },
          },
        }

        await Payment.create({
          userId: user.id,
          amount: responseObj.amountToPay,
          reference: generatedReference,
          status: 'INITIATED',
          provider: 'PAYSTACK',
          paymentMethod: 'CARD',
        })

        logger.info('Payment credentials saved to the database')
        response.created({
          success: true,
          message: 'Payment credentials fetched successfully!',
          data: responseObj,
        })
      }
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }
}
