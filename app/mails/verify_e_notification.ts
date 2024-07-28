import { BaseMail } from '@adonisjs/mail'

export default class VerifyENotification extends BaseMail {
  email: string
  otp: string
  from = 'info@example.org'
  subject = this.getSubject()
  emailTemplate: string

  constructor(email: string, otp: string, emailTemplate: string) {
    super()
    this.email = email
    this.otp = otp
    this.emailTemplate = emailTemplate
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message.to(this.email).htmlView(this.emailTemplate, {
      otp: this.otp,
    })
  }

  getSubject() {
    if (this.emailTemplate === 'reset_password') {
      return 'Reset your password'
    } else {
      return 'Verify your email'
    }
  }
}
