import { BaseMail } from '@adonisjs/mail'

export default class VerifyENotification extends BaseMail {
  email: string
  userId: string
  tokenId: string
  from = 'info@example.org'
  subject = 'Verify your email'

  constructor(email: string, userId: string, tokenId: string) {
    super()
    this.email = email
    this.userId = userId
    this.tokenId = tokenId
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message.to(this.email).htmlView('emails/verify_email_text', {
      link: `http://localhost:3000/auth/verify-email?uid=${this.userId}&tid=${this.tokenId}`,
    })
  }
}
