import { EMAIL_TEMPLATES } from '#constants/auth'
import { COMPANY_EMAIL } from '#constants/general'
import { BaseMail } from '@adonisjs/mail'

export default class VerifyENotification extends BaseMail {
  email: string
  otp: string
  from = COMPANY_EMAIL
  subject: string
  emailTemplate: string
  resetLink?: string

  constructor(email: string, emailTemplate: string, otp: string, resetLink?: string) {
    super()
    this.email = email
    this.otp = otp
    this.emailTemplate = emailTemplate
    this.subject = this.getSubject()
    this.resetLink = resetLink
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message.to(this.email).htmlView(this.emailTemplate, {
      resetLink: this.resetLink,
      otp: this.otp,
    })
  }

  getSubject() {
    if (this.emailTemplate === EMAIL_TEMPLATES.RESET_PASSWORD_OTP) {
      return 'Reset your password'
    } else {
      return 'Verify your email'
    }
  }
}
