import { EMAIL } from '#constants/general'
import { BaseMail } from '@adonisjs/mail'

interface LoanDisbursedData {
  userEmail: string
  userName: string
  loanAmount: number
  loanId: string
  disbursementDate: string
}

export default class LoanDisbursedNotification extends BaseMail {
  from = EMAIL.PROSEC
  subject = 'Loan Disbursed Successfully'
  loanData: LoanDisbursedData

  constructor(loanData: LoanDisbursedData) {
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
      .subject(`Loan Disbursed Successfully - ₦${this.loanData.loanAmount.toLocaleString()}`)
      .htmlView('emails/loan_disbursed', {
        userName: this.loanData.userName,
        loanAmount: this.loanData.loanAmount,
        loanId: this.loanData.loanId,
        disbursementDate: this.loanData.disbursementDate,
        supportEmail: EMAIL.SUPPORT,
      })
  }

  getSubject(): string {
    return this.subject
  }
}