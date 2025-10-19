import { EMAIL_TEMPLATES } from '#constants/auth'
import mail from '@adonisjs/mail/services/main'
import VerifyENotification from '#mails/verify_e_notification'
import WelcomeNotification from '#mails/welcome_notification'
class Email {
  async sendEmailVerificationMail(email: string, otp: string) {
    await mail.send(new VerifyENotification(email, EMAIL_TEMPLATES.VERIFY_EMAIL_OTP, otp))
  }

  async sendResetPasswordMail(email: string, resetLink: string) {
    await mail.send(new VerifyENotification(email, EMAIL_TEMPLATES.RESET_PASSWORD_OTP, '', resetLink))
  }

  async sendWelcomeMail(email: string, userName: string) {
    await mail.send(new WelcomeNotification({ email, userName }))
  }
}

export default new Email()
