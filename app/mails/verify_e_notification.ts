import { EMAIL_TEMPLATES } from '#constants/auth'
import { COMPANY_EMAIL } from '#constants/general'
import { BaseMail } from '@adonisjs/mail'

export default class VerifyENotification extends BaseMail {
  email: string
  // otp: string
  from = COMPANY_EMAIL
  subject: string
  emailTemplate: string
  // resetLink?: string

  constructor(email: string, emailTemplate: string) {
    super()
    this.email = email
    // this.otp = otp
    this.emailTemplate = emailTemplate
    this.subject = this.getSubject()
    // this.resetLink = resetLink
  }

  verifyOtpEmail(otp: string) {
    this.message.to(this.email).htmlView(this.emailTemplate, {
      otp,
    })
  }

  resetPasswordEmail(resetLink: string) {
    this.message.to(this.email).htmlView(this.emailTemplate, {
      resetLink,
    })
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  // prepare() {
  //   console.log('resetLink', this.resetLink)
  //   if (this.emailTemplate === EMAIL_TEMPLATES.RESET_PASSWORD_OTP) {
  //     this.resetPasswordEmail(this.resetLink)
  //   }

  //   if (this.emailTemplate === EMAIL_TEMPLATES.VERIFY_EMAIL_OTP) {
  //     this.verifyOtpEmail(this.otp)
  //   }
    // this.message.to(this.email).htmlView(this.emailTemplate, {
    //   otp: this.otp,
    //   resetLink: this.resetLink,
    // })
  // }

  getSubject() {
    if (this.emailTemplate === EMAIL_TEMPLATES.RESET_PASSWORD_OTP) {
      return 'Reset your password'
    } else {
      return 'Verify your email'
    }
  }
}
