import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Plan from './plan.js'

export default class Subscription extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare planId: string

  @column()
  declare startDate: string

  @column()
  declare endDate: string

  @column()
  declare totalPrice: number

  @column()
  declare meta: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static generateUUID(subscription: Subscription) {
    subscription.id = uuidv4()
  }

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Plan)
  declare plan: BelongsTo<typeof Plan>
}
