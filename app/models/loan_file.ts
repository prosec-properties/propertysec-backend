import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasOne } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import Loan from './loan.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'

export default class LoanDocument extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare loanId?: string

  @column()
  declare applicationId?: string

  @column()
  declare fileType:
    | 'national_id'
    | 'passport'
    | 'utility_bill'
    | 'bank_statement'
    | 'company_id'
    | 'other'

  @column()
  declare mediaType: 'image' | 'other'

  @column()
  declare fileUrl: string

  @column()
  declare fileName?: string

  @column()
  declare meta?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static generateUUID(model: LoanDocument) {
    model.id = uuidv4()
  }

  @hasOne(() => Loan)
  declare loan: HasOne<typeof Loan>

}
