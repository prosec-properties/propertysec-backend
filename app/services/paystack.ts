import env from '#start/env'
import axios, { AxiosInstance } from 'axios'
import {
  PaystackCustomerResponse,
  PaystackPlanResponse,
  PaystackVerifyTransactionResponse,
  TransactionInitializationRequest,
  TransactionInitializationResponse,
  PaystackRefundRequest,
  PaystackRefundResponse,
} from '../interfaces/payment.js'
import logger from '@adonisjs/core/services/logger'

class PaystackService {
  protected $axios: AxiosInstance

  constructor() {
    this.$axios = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: {
        authorization: 'Bearer ' + env.get('PAYSTACK_SECRET_KEY'),
      },
      timeout: 30000, // 30 seconds timeout
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

  async initializeTransaction({
    email,
    callbackUrl,
    amount,
    metadata,
  }: TransactionInitializationRequest): Promise<TransactionInitializationResponse | undefined> {
    const config = {
      reference: new Date().getTime().toString(),
      email,
      channels: ['card'],
      callback_url: callbackUrl,
      currency: 'NGN',
      amount: amount * 100, // Convert to kobo
      ...(metadata && { metadata }),
    }

    try {
      const { data } = await this.$axios.post('/transaction/initialize', config)
      return data
    } catch (error) {
      logger.error(error, 'PaystackService.initializeTransaction Error')
      this.handleError(error)
    }
  }

  async createPlan(payload: {
    name: string
    amount: number
    interval: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually'
  }) {
    try {
      const { data } = await this.$axios.post<PaystackPlanResponse>(`/plan`, payload)

      return data.data
    } catch (error) {
      this.handleError(error)
    }
  }

  async refundTransaction(reference: string, options?: Partial<PaystackRefundRequest>): Promise<PaystackRefundResponse | undefined> {
    try {
      const payload: PaystackRefundRequest = {
        transaction: reference,
        ...options,
      }
      const { data } = await this.$axios.post<PaystackRefundResponse>(`/refund`, payload)
      return data
    } catch (error) {
      console.log(error)
      this.handleError(error)
    }
  }

  async createCustomer(payload: {
    email: string
    firstName?: string
    lastName?: string
    phone?: string
  }) {
    try {
      const { data } = await this.$axios.post<PaystackCustomerResponse>(`/customer`, payload)
      return data.data
    } catch (error) {
      this.handleError(error)
    }
  }

  public handleError(error: unknown): never {
    const errorMessage = error && typeof error === 'object' && 'response' in error
      ? (error as any)?.response?.data ?? (error as any)?.response ?? error
      : error
    throw errorMessage
  }
}

export default new PaystackService()
