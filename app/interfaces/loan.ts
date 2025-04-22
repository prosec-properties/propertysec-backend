export type ILoanAmount =
  | '1000'
  | '5000'
  | '10000'
  | '20000'
  | '30000'
  | '40000'
  | '50000'
  | '100000'

export type ILoanDuration = '1 month' | '3 months' | '6 months' | '12 months'

export enum LOAN_STATUS_ENUM  {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISBURSED = 'disbursed',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}
// ['1000', '5000', '10000', '20000', '30000', '40000', '50000', '100000']
export enum LOAN_AMOUNT_ENUM {
  ONE_THOUSAND = '1000',
  FIVE_THOUSAND = '5000',
  TEN_THOUSAND = '10000',
  TWENTY_THOUSAND = '20000',
  THIRTY_THOUSAND = '30000',
  FORTY_THOUSAND = '40000',
  FIFTY_THOUSAND = '50000',
  ONE_HUNDRED_THOUSAND = '100000',
}

export enum LOAN_DURATION_ENUM {
  ONE_MONTH = '1 month',
  THREE_MONTHS = '3 months',
  SIX_MONTHS = '6 months',
  TWELVE_MONTHS = '12 months',
}

export type ILoanStatus = `${LOAN_STATUS_ENUM}`
export type ILoanAmountType = `${LOAN_AMOUNT_ENUM}`

export type ILoanReasonForFunds = 'business_expansion' | 'personal_use' | 'emergency_fund' | 'other'

export type ILoanContextType = 'loan' | 'other'

export type ILoanFileType =
  | 'passport'
  | 'utility_bill'
  | 'bank_statement'
  | 'nin'
  | 'bvn'
  | 'salary_slip'
  | 'personal_photo'
  | 'other'

export type ILoanRequestStatus = 'completed' | 'ongoing'
