import { PaymentProviders } from '#interfaces/payment'

export interface PaymentVerificationResult {
  success: boolean
  message?: string
  data?: any
}

export default class PaymentVerificationService {
  /**
   * Verify payment with Paystack
   */
  static async verifyPaystackPayment(reference: string): Promise<PaymentVerificationResult> {
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json() as any

      if (result.status && result.data?.status === 'success') {
        return {
          success: true,
          data: result.data,
        }
      } else {
        return {
          success: false,
          message: result.message || 'Payment verification failed',
          data: result.data,
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Payment verification service unavailable',
      }
    }
  }

  /**
   * Verify payment with Flutterwave
   */
  static async verifyFlutterwavePayment(transactionId: string): Promise<PaymentVerificationResult> {
    try {
      const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json() as any

      if (result.status === 'success' && result.data?.status === 'successful') {
        return {
          success: true,
          data: result.data,
        }
      } else {
        return {
          success: false,
          message: result.message || 'Payment verification failed',
          data: result.data,
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Payment verification service unavailable',
      }
    }
  }

  /**
   * Verify payment based on provider
   */
  static async verifyPayment(
    provider: PaymentProviders | 'PAYSTACK' | 'FLUTTERWAVE' | 'MANUAL',
    reference: string
  ): Promise<PaymentVerificationResult> {
    switch (provider) {
      case 'PAYSTACK':
      case 'paystack':
        return await this.verifyPaystackPayment(reference)
      case 'FLUTTERWAVE':
      case 'flutterwave':
        return await this.verifyFlutterwavePayment(reference)
      case 'MANUAL':
        // For manual payments, we assume they are verified by admin
        return {
          success: true,
          message: 'Manual payment verified',
        }
      default:
        return {
          success: false,
          message: 'Unsupported payment provider',
        }
    }
  }
}
