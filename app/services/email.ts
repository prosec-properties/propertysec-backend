import { EMAIL_TEMPLATES } from '#constants/auth'
import { COMPANY_EMAIL } from '#constants/general'
import mail from '@adonisjs/mail/services/main'

interface EmailPayload {
  email: string
  subject: string
  template: string
  data: Record<string, any>
}
class Email {
  async sendEmailVerificationMail(email: string, otp: string) {
    await this.sendEmail({
      email,
      template: EMAIL_TEMPLATES.VERIFY_EMAIL_OTP,
      data: { otp },
      subject: 'Verify your email',
    })
  }

  async sendResetPasswordMail(email: string, resetLink: string) {
    await this.sendEmail({
      email,
      template: EMAIL_TEMPLATES.RESET_PASSWORD_OTP,
      data: { resetLink },
      subject: 'Reset your password',
    })
  }

  private async sendEmail({ email, subject, template, data }: EmailPayload) {
    await mail.sendLater((message) => {
      message
        .to(email)
        .from(COMPANY_EMAIL)
        .subject(subject)
        .htmlView(template, { ...data })
    })
  }
}

export default new Email()
