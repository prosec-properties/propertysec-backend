import { EMAIL_TEMPLATES } from '#constants/auth'
import mail from '@adonisjs/mail/services/main'
import VerifyENotification from '#mails/verify_e_notification'
import WelcomeNotification from '#mails/welcome_notification'
import frontendEmailService from '#services/frontend_email'

class Email {
  async sendEmailVerificationMail(email: string, otp: string) {
    if (await frontendEmailService.sendVerifyEmailOtp(email, otp)) {
      return
    }

    await mail.send(new VerifyENotification(email, EMAIL_TEMPLATES.VERIFY_EMAIL_OTP, otp))
  }

  async sendResetPasswordMail(email: string, resetLink: string) {
    if (await frontendEmailService.sendResetPasswordEmail(email, resetLink)) {
      return
    }

    await mail.send(new VerifyENotification(email, EMAIL_TEMPLATES.RESET_PASSWORD_OTP, '', resetLink))
  }

  async sendWelcomeMail(email: string, userName: string) {
    if (await frontendEmailService.sendWelcomeEmail(email, userName)) {
      return
    }

    await mail.send(new WelcomeNotification({ email, userName }))
  }
}

export default new Email()
