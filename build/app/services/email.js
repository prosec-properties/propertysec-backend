import { EMAIL_TEMPLATES } from '#constants/auth';
import { COMPANY_EMAIL } from '#constants/general';
import mail from '@adonisjs/mail/services/main';
class Email {
    async sendEmailVerificationMail(email, otp) {
        await this.sendEmail({
            email,
            template: EMAIL_TEMPLATES.VERIFY_EMAIL_OTP,
            data: { otp },
            subject: 'Verify your email',
        });
    }
    async sendResetPasswordMail(email, resetLink) {
        await this.sendEmail({
            email,
            template: EMAIL_TEMPLATES.RESET_PASSWORD_OTP,
            data: { resetLink },
            subject: 'Reset your password',
        });
    }
    async sendEmail({ email, subject, template, data }) {
        await mail.send((message) => {
            message
                .to(email)
                .from(COMPANY_EMAIL)
                .subject(subject)
                .htmlView(template, { ...data });
        });
    }
}
export default new Email();
//# sourceMappingURL=email.js.map