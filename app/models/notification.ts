import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasOne } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare data: string

  @column()
  declare message: string

  @column()
  declare isRead: boolean

  @column()
  declare readAt: string

  @column()
  declare meta?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static generateUUID(model: Notification) {
    model.id = uuidv4()
  }

  @hasOne(() => User)
  declare user: HasOne<typeof User>
}
