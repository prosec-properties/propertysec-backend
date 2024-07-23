import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasOne } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import LoanApplicant from './loan_applicant.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import Loan from './loan.js'

export default class LoanApplication extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare applicantId: string

  @column()
  declare loanId: string

  @column.date()
  declare applicationDate: DateTime

  @column()
  declare applicationStatus: string

  @column()
  declare meta: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static generateUUID(model: LoanApplication) {
    model.id = uuidv4()
  }

  @hasOne(() => LoanApplicant)
  declare loanApplicant: HasOne<typeof LoanApplicant>

  @hasOne(() => Loan)
  declare loan: HasOne<typeof Loan>
}
