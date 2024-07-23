import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import { v4 as uuidv4 } from 'uuid'

export default class Newsletter extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare email: string

  @column()
  declare status: 'subscribed' | 'unsubscribed' | 'pending'

  @column()
  declare ipInfo?: string

  @column()
  declare unsubscribedAt?: string

  @column()
  declare unsubscribeReason?: string

  @column()
  declare userId?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static generateUUID(model: Newsletter) {
    model.id = uuidv4()
  }

  @hasOne(() => User)
  declare user: HasOne<typeof User>
}
