/**
 * Frontend email forwarding has been retired. This stub remains for backwards
 * compatibility and always reports that the integration is disabled.
 */
class NoopFrontendEmailService {
  get isEnabled() {
    return false
  }

  private async dispatch() {
    return false
  }

  async sendVerifyEmailOtp() {
    return this.dispatch()
  }

  async sendResetPasswordEmail() {
    return this.dispatch()
  }

  async sendWelcomeEmail() {
    return this.dispatch()
  }

  async sendPropertyCreatedEmail() {
    return this.dispatch()
  }

  async sendPropertyPublishedEmail() {
    return this.dispatch()
  }

  async sendPropertyRejectedEmail() {
    return this.dispatch()
  }

  async sendPropertyPurchaseEmail() {
    return this.dispatch()
  }

  async sendInspectionApprovedEmail() {
    return this.dispatch()
  }

  async sendInspectionRejectedEmail() {
    return this.dispatch()
  }

  async sendInspectionCompletedEmail() {
    return this.dispatch()
  }

  async sendLoanApprovedEmail() {
    return this.dispatch()
  }

  async sendLoanDisbursedEmail() {
    return this.dispatch()
  }

  async sendLoanRejectedEmail() {
    return this.dispatch()
  }
}

export default new NoopFrontendEmailService()
