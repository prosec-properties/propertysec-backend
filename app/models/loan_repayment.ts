import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Loan from './loan.js'
import User from './user.js'

export default class LoanRepayment extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare loanId: string

  @column()
  declare userId: string

  @column()
  declare repaymentAmount: number

  @column()
  declare repaymentType: 'PARTIAL' | 'FULL' | 'INTEREST' | 'PRINCIPAL'

  @column()
  declare paymentMethod: 'CARD' | 'BANK_TRANSFER' | 'WALLET' | 'CASH'

  @column()
  declare paymentReference: string

  @column()
  declare paymentProvider: 'PAYSTACK' | 'FLUTTERWAVE' | 'MANUAL'

  @column()
  declare repaymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'

  @column()
  declare outstandingBalance: number

  @column()
  declare principalAmount: number

  @column()
  declare interestAmount: number

  @column()
  declare penaltyAmount?: number

  @column()
  declare meta?: string

  @column.dateTime()
  declare dueDate?: DateTime

  @column.dateTime()
  declare repaymentDate?: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Loan)
  declare loan: BelongsTo<typeof Loan>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @beforeCreate()
  static generateUUID(loanRepayment: LoanRepayment) {
    loanRepayment.id = uuidv4()
  }
}
