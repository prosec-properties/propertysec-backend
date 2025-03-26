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

export type ILoanStatus = 'pending' | 'approved' | 'rejected' | 'disbursed'

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
