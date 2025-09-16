export const CURRENCIES_ENUM = ['USD', 'NGN', 'GBP', 'EUR', 'ZAR', 'KES', 'GHS', 'XOF'] as const

export type AcceptedCurrencies = 'NGN' | 'GHS' | 'ZAR' | 'USD' | 'PROSEC Credits'

export type PaymentProviders = 'paystack' | 'flutterwave'

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAIL' | 'INITIALIZE' | 'REFUNDED'

export type TransactionType = 'subscription' | 'wallet:credit' | 'wallet:debit' | 'inspection' | 'property_purchase' | 'loan_repayment' | 'affiliate'

export type PlanName = 'FREE' | 'GOLD' | 'PLATINUM' | 'SILVER' | 'UNLIMITED' 

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

export interface PaystackPlanResponse {
  status: boolean;
  message: string;
  data: {
    name: string;
    amount: number;
    interval: string;
    integration: number;
    domain: string;
    plan_code: string;
    send_invoices: boolean;
    send_sms: boolean;
    hosted_page: boolean;
    currency: string;
    id: number;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
  };
}

export interface PaystackCustomerResponse {
  status: boolean;
  message: string;
  data: {
    email: string;
    integration: number;
    domain: string;
    customer_code: string;
    id: number;
    identified: boolean;
    identifications: any | null; // You can replace 'any' with a more specific type if known
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
  };
}

// Refund-related interfaces
export interface PaystackRefundRequest {
  transaction: string;
  amount?: number;
  currency?: string;
  customer_note?: string;
  merchant_note?: string;
}

export interface PaystackRefundResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    currency: string;
    transaction_reference: string;
    status: 'pending' | 'successful' | 'failed';
    customer_note?: string;
    merchant_note?: string;
    created_at: string;
    updated_at: string;
  };
}

// Transaction initialization interfaces
export interface TransactionInitializationRequest {
  email: string;
  callbackUrl: string;
  amount: number;
  metadata?: TransactionMetadata;
}

export interface TransactionInitializationResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

// Transaction metadata interfaces
export interface TransactionMetadata {
  type: TransactionType;
  userId: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  // Subscription specific
  planId?: string;
  // Property specific
  propertyId?: string;
  propertyTitle?: string;
  currency?: AcceptedCurrencies;
  // Loan specific
  loanId?: string;
  repaymentAmount?: number;
  repaymentType?: 'FULL' | 'PARTIAL';
  // Affiliate
  affiliateId?: string;
  // Additional metadata
  [key: string]: any;
}

// Transaction verification interfaces
export interface TransactionVerificationRequest {
  reference: string;
  paymentReference?: string;
}

export interface TransactionVerificationResponse {
  status: boolean;
  message: string;
  data: PaystackVerifyTransactionResponse;
}

// Transaction handling interfaces
export interface SubscriptionTransactionData {
  userId: string;
  planId: string;
  amount: number;
  reference: string;
  paystackResponse: PaystackVerifyTransactionResponse;
}

export interface InspectionTransactionData {
  userId: string;
  propertyId: string;
  amount: number;
  paystackResponse: PaystackVerifyTransactionResponse;
  metadata: TransactionMetadata;
}

export interface PropertyPurchaseTransactionData {
  userId: string;
  propertyId: string;
  propertyTitle: string;
  amount: number;
  currency: AcceptedCurrencies;
  paystackResponse: PaystackVerifyTransactionResponse;
  metadata: TransactionMetadata;
}

export interface LoanRepaymentTransactionData {
  userId: string;
  loanId: string;
  amount: number;
  repaymentType: 'FULL' | 'PARTIAL';
  paystackResponse: PaystackVerifyTransactionResponse;
  metadata: TransactionMetadata;
}

// Affiliate commission interface
export interface AffiliateCommissionData {
  affiliateId: string;
  amount: number;
  type: TransactionType;
  propertyId?: string;
  propertyTitle?: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Error response interface
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}
