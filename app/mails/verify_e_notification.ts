import { BaseMail } from '@adonisjs/mail'

export default class VerifyENotification extends BaseMail {
  email: string
  otp: string
  from = 'info@example.org'
  subject = 'Verify your email'

  constructor(email: string, otp: string) {
    super()
    this.email = email
    this.otp = otp
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message.to(this.email).htmlView('emails/verify_email_html', {
      otp: this.otp
    })
  }
}
