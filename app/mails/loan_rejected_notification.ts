import { EMAIL } from '#constants/general'
import { BaseMail } from '@adonisjs/mail'

interface LoanRejectedData {
  userEmail: string
  userName: string
  loanAmount: number
  loanId: string
  reason?: string
}

export default class LoanRejectedNotification extends BaseMail {
  from = EMAIL.PROSEC
  subject = 'Loan Application Update'
  loanData: LoanRejectedData

  constructor(loanData: LoanRejectedData) {
    super()
    this.loanData = loanData
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message
      .to(this.loanData.userEmail)
      .subject(`Loan Application Update - ₦${this.loanData.loanAmount.toLocaleString()}`)
      .htmlView('emails/loan_rejected', {
        userName: this.loanData.userName,
        loanAmount: this.loanData.loanAmount,
        loanId: this.loanData.loanId,
        reason: this.loanData.reason || 'No specific reason provided',
        supportEmail: EMAIL.SUPPORT,
      })
  }

  getSubject(): string {
    return this.subject
  }
}