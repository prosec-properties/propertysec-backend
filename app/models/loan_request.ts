import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class LoanRequest extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare amount: string

  @column()
  declare duration: string

  @column()
  declare noOfRooms: string

  @column()
  declare noOfYears: string

  @column()
  declare reasonForLoanRequest: string


  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async createUUID(loanRequest: LoanRequest) {
    loanRequest.id = uuidv4()
    }

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
} 