import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import type { ILoanContextType } from '#interfaces/loan'

export default class Bank extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare averageSalary: string

  @column()
  declare bankName: string

  @column()
  declare salaryAccountNumber: string

  @column()
  declare nin: string

  @column()
  declare bvn: string

  @column()
  declare contextId: string

  @column()
  declare contextType: ILoanContextType

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async createUUID(bank: Bank) {
    bank.id = uuidv4()
  }

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
} 