import env from '#start/env'
import axios, { AxiosInstance } from 'axios'
import { PaystackCustomerResponse, PaystackPlanResponse, PaystackVerifyTransactionResponse } from '../interfaces/payment.js'
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

  async createCustomer(payload:{
    email: string
    firstName?: string
    lastName?: string
    phone?: string
  }){
    try {
      const { data } = await this.$axios.post<PaystackCustomerResponse>(`/customer`, payload)
      return data.data
    } catch (error) {
      this.handleError(error)
    }
  }

  public handleError(error: any) {
    throw error?.response?.data ?? error?.response ?? error
  }
}

export default new PaystackService()
