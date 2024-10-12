import env from '#start/env'
import axios, { AxiosInstance } from 'axios'
import { PaystackVerifyTransactionResponse } from '../interfaces/payment.js'
import logger from '@adonisjs/core/services/logger'

class PaystackService {
  protected $axios: AxiosInstance

  constructor() {
    this.$axios = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: {
        authorization: 'Bearer ' + env.get('PAYSTACK_SECRET_KEY'),
      },
    })
  }
  async verifyTransaction(
    reference: string
  ): Promise<PaystackVerifyTransactionResponse | undefined> {
    try {
      const { data } = await this.$axios.get(`/transaction/verify/${reference}`)

      const response = data.data

      return {
        ...response,
        transactionNarration: data.message,
        provider: 'paystack',
      }
    } catch (error) {
      logger.error(
        error,
        `PaystackService.verifyTransaction Error Verifying transaction ${reference}`
      )
      this.handleError(error)
    }
  }

  public handleError(error: any) {
    throw error?.response?.data ?? error?.response ?? error
  }
}

export default new PaystackService()
