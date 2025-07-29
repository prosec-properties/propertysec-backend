import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import LoanFile from './loan_file.js'
import LoanRepayment from './loan_repayment.js'
import User from './user.js'
import type { ILoanAmount, ILoanDuration, ILoanStatus } from '#interfaces/loan'

export default class Loan extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare loanAmount: ILoanAmount

  @column()
  declare interestRate: number

  @column()
  declare loanDuration: ILoanDuration

  @column()
  declare loanStatus: ILoanStatus

  @column()
  declare reasonForFunds: string

  @column()
  declare hasCompletedForm: boolean

  @column()
  declare meta?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => LoanFile)
  declare files: HasMany<typeof LoanFile>

  @hasMany(() => LoanRepayment)
  declare repayments: HasMany<typeof LoanRepayment>

  @beforeCreate()
  static generateId(property: Loan) {
    property.id = uuidv4()
  }
}
