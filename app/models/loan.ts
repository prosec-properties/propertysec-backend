import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'

export default class Loan extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  // @column()
  // declare loanType: 'personal' | 'business' | 'mortgage' | 'auto' | 'rent'

  @column()
  declare loanAmount: '1000' | '5000' | '10000' | '20000' | '30000' | '40000' | '50000' | '100000'

  @column()
  declare interestRate: number

  @column()
  declare loanDuration: '1 month' | '3 months' | '6 months' | '12 months'

  @column()
  declare loanStatus: 'pending' | 'approved' | 'rejected' | 'disbursed'

  @column()
  declare hasCompletedForm: boolean

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
