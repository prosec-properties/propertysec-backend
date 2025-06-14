import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import Property from './property.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'

export default class PropertyPurchase extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare propertyId: string

  @column()
  declare purchaseAmount: number

  @column()
  declare currency: string

  @column()
  declare purchaseStatus: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'

  @column()
  declare transactionReference: string

  @column()
  declare buyerName: string

  @column()
  declare buyerEmail: string

  @column()
  declare buyerPhone: string

  @column()
  declare meta?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Property)
  declare property: BelongsTo<typeof Property>

  @beforeCreate()
  static generateUUID(propertyPurchase: PropertyPurchase) {
    propertyPurchase.id = uuidv4()
  }
}
