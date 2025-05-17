import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import Property from './property.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class AffiliateProperty extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare affiliateUserId: string

  @column()
  declare propertyId: string

  @column()
  declare commission: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async createUUID(bank: AffiliateProperty) {
    bank.id = uuidv4()
  }

  @belongsTo(() => Property)
  declare property: BelongsTo<typeof Property>
}
