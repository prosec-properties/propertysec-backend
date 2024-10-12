export const CURRENCIES_ENUM = ['USD', 'NGN', 'GBP', 'EUR', 'ZAR', 'KES', 'GHS', 'XOF'] as const

export type AcceptedCurrencies = 'NGN' | 'GHS' | 'ZAR' | 'USD' | 'PROSEC Credits'

export type PaymentProviders = 'paystack' | 'flutterwave'

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAIL' | 'INITIALIZE'

export type TransactionType = 'subscription' | 'wallet:credit' | 'wallet:debit'

export type PlanName = 'PRO' | 'LUX' | 'VIP' 

export interface PaystackVerifyTransactionResponse {
  id: number
  domain: string
  status: string
  reference: string
  receipt_number: null | any
  amount: number
  message: null | any
  gateway_response: string
  paid_at: string
  created_at: string
  channel: string
  currency: string
  ip_address: string
  metadata: PaystackMetadata
  log: PaystackLog
  fees: number
  fees_split: null | any
  authorization: PaystackAuthorization
  customer: PaystackCustomer
  plan: null | any
  split: Record<string, any>
  order_id: null | any
  paidAt: string
  createdAt: string
  requested_amount: number
  pos_transaction_data: null | any
  source: null | any
  fees_breakdown: null | any
  transaction_date: string
  plan_object: Record<string, any>
  subaccount: Record<string, any>
  transactionNarration: string
  provider: PaymentProviders
}

export interface PaystackMetadata {
  type?: TransactionType
  transactionId?: string
  amount?: number
  walletAmount?: number
  fee?: number
  referrer: string
  custom_fields?: PaystackCustomFields[]
  cancel_action?: string
  custom_filters?: PaystackCustomFilter
  [key: string]: any
}

export interface PaystackCustomer {
  id: number
  first_name: string
  last_name: string
  email: string
  customer_code: string
  phone: string
  metadata: null | any
  risk_action: string
  international_format_phone: null | any
}

export interface PaystackAuthorization {
  authorization_code: string
  bin: string
  last4: string
  exp_month: string
  exp_year: string
  channel: string
  card_type: string
  bank: string
  country_code: string
  brand: string
  reusable: boolean
  signature: string
  account_name: null | any
  receiver_bank_account_number: null | any
  receiver_bank: null | any
}

export interface PaystackLog {
  start_time: number
  time_spent: number
  attempts: number
  errors: number
  success: boolean
  mobile: boolean
  input: any[]
  history: PaystackLogHistory[]
}

export interface PaystackLogHistory {
  type: string
  message: string
  time: number
}

interface PaystackCustomFilter {
  recurring?: boolean
  banks?: string[]
  card_brands?: Array<'visa' | 'verve' | 'master' | string>
}

interface PaystackCustomFields {
  display_name?: string
  variable_name?: string
  value?: any
}

export interface PaystackConfig {
  publicKey: string
  email: string
  firstname?: string
  lastname?: string
  phone?: number | string
  amount: number
  ref?: string
  metadata?: Partial<PaystackMetadata>
  currency?: 'NGN' | 'GHS' | 'USD' | 'ZAR' | string
  channels?: PaymentChannels[]
  label?: string
  plan?: string
  quantity?: number
  subaccount?: string
  transaction_charge?: number
  bearer?: Bearer
  split_code?: string
  split?: Record<string, any>
}

type PaymentChannels = 'bank' | 'card' | 'qr' | 'ussd' | 'mobile_money' | 'bank_transfer' | string

type Bearer = 'account' | 'subaccount' | string

export type PaymentCredentials = {
  paystackConfig?: PaystackConfig
  reference?: string
  expiresAt?: string | null
  bankName?: string
  acctNumber?: string
  acctName?: string

  isPaid: boolean
  amountToPay: number
  walletAmountToPay?: number
  discountPercentage?: number
  actualTotalAmount?: number
  amountLeftOnCurrentPlan?: number

  pdfUrl?: string
  planName?: string,
  planDuration?: string,
}
