import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import type { ILoanContextType } from '#interfaces/loan'

export default class Employment extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare officeName: string

  @column()
  declare employerName: string

  @column()
  declare positionInOffice: string

  @column()
  declare officeContact: string

  @column()
  declare officeAddress: string

  @column()
  declare monthlySalary: string

  @column()
  declare contextId: string

  @column()
  declare contextType: ILoanContextType

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async createUUID(employment: Employment) {
    employment.id = uuidv4()
  }

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
} 