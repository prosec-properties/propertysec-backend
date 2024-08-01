import { EMAIL_TEMPLATES } from '#constants/auth';
import { COMPANY_EMAIL } from '#constants/general';
import { BaseMail } from '@adonisjs/mail';
export default class VerifyENotification extends BaseMail {
    email;
    otp;
    from = COMPANY_EMAIL;
    subject;
    emailTemplate;
    resetLink;
    constructor(email, emailTemplate, otp, resetLink) {
        super();
        this.email = email;
        this.otp = otp;
        this.emailTemplate = emailTemplate;
        this.subject = this.getSubject();
        this.resetLink = resetLink;
    }
    prepare() {
        this.message.to(this.email).htmlView(this.emailTemplate, {
            resetLink: this.resetLink,
            otp: this.otp,
        });
    }
    getSubject() {
        if (this.emailTemplate === EMAIL_TEMPLATES.RESET_PASSWORD_OTP) {
            return 'Reset your password';
        }
        else {
            return 'Verify your email';
        }
    }
}
//# sourceMappingURL=verify_e_notification.js.map