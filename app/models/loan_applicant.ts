import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasOne } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import User from './user.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'
export default class LoanApplicant extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare nationality: string

  @column()
  declare state: string

  @column()
  declare city: string

  @column()
  declare religion: string

  @column()
  declare currentAddress: string

  @column()
  declare monthlySalary: number

  @column()
  declare bankName: string

  @column()
  declare bankAccountNumber: string

  @column()
  declare bankAccountName: string

  @column()
  declare nin: string

  @column()
  declare bvn: string

  @column()
  declare companyAddress: string

  @column()
  declare companyName: string

  @column()
  declare companyPosition: string

  @column()
  declare companyPhoneNumber: string

  @column()
  declare companyEmail: string

  @column()
  declare yearsInApartment: number

  @column()
  declare numberOfRooms: number

  @column()
  declare reasonForFunds: string

  @column()
  declare landlordName: string

  @column()
  declare landlordPhoneNumber: string

  @column()
  declare landlordEmail: string

  @column()
  declare landlordAddress: string

  @column()
  declare landlordBankName: string

  @column()
  declare landlordBankAccountNumber: string

  @column()
  declare landlordBankAccountName: string

  @column()
  declare guarantorName: string

  @column()
  declare guarantorPhoneNumber: string

  @column()
  declare guarantorEmail: string

  @column()
  declare guarantorHomeAddress: string

  @column()
  declare guarantorOfficeAddress: string

  @column()
  declare meta: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static generateUUID(model: LoanApplicant) {
    model.id = uuidv4()
  }

  @hasOne(() => User)
  declare user: HasOne<typeof User>
}
