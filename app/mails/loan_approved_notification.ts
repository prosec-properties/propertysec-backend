import { EMAIL } from '#constants/general'
import { BaseMail } from '@adonisjs/mail'

interface LoanApprovedData {
  userEmail: string
  userName: string
  loanAmount: number
  loanId: string
  loanDuration: string
}

export default class LoanApprovedNotification extends BaseMail {
  from = EMAIL.PROSEC
  subject = 'Loan Application Approved'
  loanData: LoanApprovedData

  constructor(loanData: LoanApprovedData) {
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
      .subject(`Loan Application Approved - ₦${this.loanData.loanAmount.toLocaleString()}`)
      .htmlView('emails/loan_approved', {
        userName: this.loanData.userName,
        loanAmount: this.loanData.loanAmount,
        loanId: this.loanData.loanId,
        loanDuration: this.loanData.loanDuration,
        supportEmail: EMAIL.SUPPORT,
      })
  }

  getSubject(): string {
    return this.subject
  }
}