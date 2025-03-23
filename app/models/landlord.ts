import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import type { ILoanContextType } from '#interfaces/loan'
export default class Landlord extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare name: string

  @column()
  declare bankName: string

  @column()
  declare accountNumber: string

  @column()
  declare address: string

  @column()
  declare phoneNumber: string

  @column()
  declare contextId: string

  @column()
  declare contextType: ILoanContextType

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async createUUID(landlord: Landlord) {
    landlord.id = uuidv4()
  }

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
} 