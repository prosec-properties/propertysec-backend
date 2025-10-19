import { EMAIL } from '#constants/general'
import env from '#start/env'
import axios from 'axios'
import logger from '@adonisjs/core/services/logger'

type EmailTemplateType =
  | 'verify-email-otp'
  | 'reset-password-otp'
  | 'welcome-email'
  | 'property-created'
  | 'property-published'
  | 'property-rejected'
  | 'property-purchase'
  | 'inspection-approved'
  | 'inspection-rejected'
  | 'inspection-completed'
  | 'loan-approved'
  | 'loan-disbursed'
  | 'loan-rejected'

type EmailRecipient = string | string[]

class FrontendEmailService {
  private readonly useFrontendEmails = env.get('USE_FRONTEND_EMAILS', false)
  private readonly endpoint = env.get('FRONTEND_EMAIL_ENDPOINT', '')
  private readonly apiKey = env.get('FRONTEND_EMAIL_API_KEY', '')

  get isEnabled() {
    return this.useFrontendEmails
  }

  private async dispatch(type: EmailTemplateType, to: EmailRecipient, data: Record<string, unknown>) {
    if (!this.isEnabled) {
      return false
    }

    if (!this.endpoint || !this.apiKey) {
      logger.error('Frontend email dispatch is enabled but endpoint or API key is not configured')
      throw new Error('Frontend email dispatch configuration is incomplete')
    }

    try {
      await axios.post(
        this.endpoint,
        {
          type,
          to,
          data,
        },
        {
          headers: {
            'x-email-api-key': this.apiKey,
            'content-type': 'application/json',
          },
          timeout: 10000,
        }
      )
      return true
    } catch (error) {
      logger.error({ err: error }, 'Failed to forward email dispatch to frontend service')
      throw error
    }
  }

  async sendVerifyEmailOtp(to: string, otp: string) {
    return this.dispatch('verify-email-otp', to, { otp })
  }

  async sendResetPasswordEmail(to: string, resetLink: string) {
    return this.dispatch('reset-password-otp', to, { resetLink })
  }

  async sendWelcomeEmail(to: string, userName: string) {
    return this.dispatch('welcome-email', to, { userName })
  }

  async sendPropertyCreatedEmail(to: string, payload: { userName: string; propertyTitle: string; propertyId: string }) {
    return this.dispatch('property-created', to, {
      ...payload,
      supportEmail: EMAIL.SUPPORT,
    })
  }

  async sendPropertyPublishedEmail(
    to: string,
    payload: { userName: string; propertyTitle: string; propertyId: string }
  ) {
    return this.dispatch('property-published', to, {
      ...payload,
      supportEmail: EMAIL.SUPPORT,
    })
  }

  async sendPropertyRejectedEmail(
    to: string,
    payload: { userName: string; propertyTitle: string; propertyId: string; reason: string }
  ) {
    return this.dispatch('property-rejected', to, {
      ...payload,
      supportEmail: EMAIL.SUPPORT,
    })
  }

  async sendPropertyPurchaseEmail(
    to: string,
    payload: {
      buyerName: string
      propertyTitle: string
      propertyAddress: string
      purchaseAmount: number | string
      currency: string
      transactionReference: string
      purchaseDate: string
    }
  ) {
    return this.dispatch('property-purchase', to, {
      ...payload,
      supportEmail: EMAIL.SUPPORT,
    })
  }

  async sendInspectionApprovedEmail(
    to: string,
  payload: { userName: string; propertyTitle: string; inspectionId: string; inspectionAmount: number | string }
  ) {
    return this.dispatch('inspection-approved', to, {
      ...payload,
      supportEmail: EMAIL.SUPPORT,
    })
  }

  async sendInspectionRejectedEmail(
    to: string,
    payload: { userName: string; propertyTitle: string; inspectionId: string; reason: string }
  ) {
    return this.dispatch('inspection-rejected', to, {
      ...payload,
      supportEmail: EMAIL.SUPPORT,
    })
  }

  async sendInspectionCompletedEmail(
    to: string,
    payload: { userName: string; propertyTitle: string; inspectionId: string; inspectionReport: string }
  ) {
    return this.dispatch('inspection-completed', to, {
      ...payload,
      supportEmail: EMAIL.SUPPORT,
    })
  }

  async sendLoanApprovedEmail(
    to: string,
  payload: { userName: string; loanAmount: number | string; loanId: string; loanDuration: string }
  ) {
    return this.dispatch('loan-approved', to, {
      ...payload,
      supportEmail: EMAIL.SUPPORT,
    })
  }

  async sendLoanDisbursedEmail(
    to: string,
  payload: { userName: string; loanAmount: number | string; loanId: string; disbursementDate: string }
  ) {
    return this.dispatch('loan-disbursed', to, {
      ...payload,
      supportEmail: EMAIL.SUPPORT,
    })
  }

  async sendLoanRejectedEmail(
    to: string,
  payload: { userName: string; loanAmount: number | string; loanId: string; reason: string }
  ) {
    return this.dispatch('loan-rejected', to, {
      ...payload,
      supportEmail: EMAIL.SUPPORT,
    })
  }
}

export default new FrontendEmailService()
