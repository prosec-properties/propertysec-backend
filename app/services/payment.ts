import { AcceptedCurrencies, PaymentProviders } from '#interfaces/payment'
import PaystackService from '#services/paystack'

class Payment {
  async verifyTransaction({
    provider = 'paystack',
    reference,
  }: {
    provider: PaymentProviders
    reference: string
    currency?: AcceptedCurrencies
  }) {
    if (!reference) throw new Error('Transfer reference is required')

    switch (provider) {
      case 'paystack':
        return PaystackService.verifyTransaction(reference)
      case 'flutterwave':
      default:
        throw new Error('Invalid payment provider')
    }
  }
}

export default new Payment()
