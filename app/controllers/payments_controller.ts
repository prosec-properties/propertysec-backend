import { getErrorObject } from '#helpers/error'
import {
  calculateVat,
  formatPrice,
  getDiscountAmount,
  getPaystackAmount,
  getPaystackAmountFee,
  randomNumericString,
} from '#helpers/payment'
import { PaymentCredentials } from '#interfaces/payment'
import Invoice from '#models/invoice'
import Payment from '#models/payment'
import Plan from '#models/plan'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { nanoid } from 'nanoid'
import pdf from '#services/pdf'
import { PROSEC_BANK_DETAILS } from '#constants/payment'

export default class PaymentsController {
  async initializeSubscriptionPayment({ auth, request, response, logger }: HttpContext) {
    try {
      await auth.authenticate()
      const { planId, type } = request.all()
      const user = auth.user!
      const plan = await Plan.findByOrFail('id', planId)

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
      if (type === 'transfer') {
        const hasInvoice = await Invoice.query()
          .where('user_id', user.id)
          .where('plan_id', plan.id)
          .where('due_date', '>', DateTime.now().toISO() as string)
          .first()

        if (hasInvoice) {
          responseObj = {
            ...responseObj,
            amountToPay: hasInvoice.amount,
            reference: hasInvoice.paymentId,
            expiresAt: hasInvoice.dueDate,
            bankName: hasInvoice.bankName,
            acctNumber: hasInvoice.accountNumber,
            acctName: hasInvoice.accountName,
            
            planName: plan.name,
            planDuration: String(plan.duration),
            pdfUrl: (
              await pdf.generatePDF({
                type: 'transfer-invoice',
                data: {
                  invoice: hasInvoice,
                },
                user,
              })
            ).toString(),
          }
        } else {
          const totalAmountToPay = Math.floor(
            responseObj.amountToPay + calculateVat(responseObj.amountToPay)
          )
          const invoice = await Invoice.create({
            userId: user.id,
            planId: plan.id,
            // subscriptionId: plan.subscriptions?.[-1]?.id,
            amount: totalAmountToPay,
            vat: Math.floor(calculateVat(responseObj.amountToPay)),
            paymentId: randomNumericString(11),
            dueDate: DateTime.now().plus({ days: 10 }).toISO() as string,
            bankName: PROSEC_BANK_DETAILS.name,
            accountNumber: PROSEC_BANK_DETAILS.accountNumber,
            accountName: PROSEC_BANK_DETAILS.accountName,
            discount: plan.discountPercentage,
            invoiceData: {
              tableData: [
                {
                  description: `Subscription to ${plan.name} subscription. Duration: ${plan.duration} month`,
                  unitPrice: formatPrice(plan.price),
                  vat: '7.5%',
                  total: formatPrice(Math.floor(plan.price + calculateVat(plan.price))),
                },
                ...(plan.discountPercentage
                  ? [
                      {
                        description: `Plan discount`,
                        unitPrice: formatPrice(plan.price * (plan.discountPercentage / 100)),
                        vat: '7.5%',
                        total:
                          '-' +
                          formatPrice(
                            Math.floor(
                              plan.price * (plan.discountPercentage / 100) +
                                calculateVat(plan.price * (plan.discountPercentage / 100))
                            )
                          ),
                      },
                    ]
                  : []),
                ...(responseObj.walletAmountToPay
                  ? [
                      {
                        description: `Wallet debit`,
                        unitPrice: formatPrice(responseObj.walletAmountToPay),
                        vat: '0%',
                        total: '-' + formatPrice(responseObj.walletAmountToPay),
                      },
                    ]
                  : []),
              ],
            },
          })

          const pdfBuffer = await pdf.generatePDF({
            type: 'transfer-invoice',
            data: {
              invoice: hasInvoice || invoice
            },
            user,
          });

          responseObj = {
            ...responseObj,
            amountToPay: invoice.amount,
            reference: invoice.paymentId,
            expiresAt: invoice.dueDate,
            bankName: invoice.bankName,
            acctNumber: invoice.accountNumber,
            acctName: invoice.accountName,
            planName: plan.name,
            planDuration: String(plan.duration),
            pdfUrl: `data:application/pdf;base64,${pdfBuffer.toString()}`,
          }
        }
        logger.info('Payment credentials saved to the database')
        response.created({
          success: true,
          message: 'Payment credentials fetched successfully!',
          data: responseObj,
        })
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
            ref: responseObj.reference,
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
    } catch (error) {
      return response.badRequest(getErrorObject(error))
    }
  }
}
