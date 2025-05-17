import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import { v4 } from 'uuid'

export default class Wallet extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare balance: number

  @column()
  declare ledgerBalance: number

  @column()
  declare totalBalance: number

  @column()
  declare totalSpent: number

  @column()
  declare currency: string

  @column()
  declare meta?: string

  @column()
  declare type: 'main' | 'affiliate'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  //Hooks
  @beforeCreate()
  static generateDefaultId(data: Wallet) {
    if (!data.$dirty.id) {
      data.id = v4()
    }
  }

  // Relationships
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}