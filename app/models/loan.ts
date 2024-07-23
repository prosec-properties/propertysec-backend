import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'

export default class Loan extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare loanType: 'personal' | 'business' | 'mortgage' | 'auto' | 'rent'

  @column()
  declare loanAmount: number

  @column()
  declare interestRate: number

  @column()
  declare loanDuration: '1 month' | '3 months' | '6 months' | '12 months'

  @column()
  declare loanStatus: 'pending' | 'approved' | 'rejected' | 'disbursed'

  @column()
  declare meta: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static generateId(property: Loan) {
    property.id = uuidv4()
  }
}
