import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'

export default class LoanDocument extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare applicationId: string

  @column()
  declare documentType:
    | 'national_id'
    | 'passport'
    | 'utility_bill'
    | 'bank_statement'
    | 'company_id'

  @column()
  declare documentUrl: string

  @column()
  declare meta: string

  @column()
  declare documentName: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static generateUUID(model: LoanDocument) {
    model.id = uuidv4()
  }
}
