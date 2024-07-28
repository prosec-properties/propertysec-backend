import VerifyENotification from '#mails/verify_e_notification'
import mail from '@adonisjs/mail/services/main'

class Email {
  async sendEmail(email: string, otp: string, emailTemplate: string, resetLink?: string) {
    return await mail.sendLater(new VerifyENotification(email, otp, emailTemplate, resetLink))
  }

  // async sendResetPasswordEmail(email: string, otp: string, resetLink: string) {
  //   return await mail.sendLater(email, otp, 'emails/reset_password_otp', resetLink)
  // }
}

export default new Email()
