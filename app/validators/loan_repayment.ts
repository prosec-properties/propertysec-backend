import vine from '@vinejs/vine'

export const loanRepaymentValidator = vine.compile(
  vine.object({
    repaymentAmount: vine.number().min(1).positive(),
    repaymentType: vine.enum(['PARTIAL', 'FULL', 'INTEREST', 'PRINCIPAL']).optional(),
    paymentMethod: vine.enum(['CARD', 'BANK_TRANSFER', 'WALLET', 'CASH']).optional(),
    email: vine.string().email(),
    callbackUrl: vine.string(),
    amount: vine.number(),
  })
)

export const verifyRepaymentValidator = vine.compile(
  vine.object({
    paymentReference: vine.string().minLength(1),
    providerResponse: vine.any().optional(),
  })
)
