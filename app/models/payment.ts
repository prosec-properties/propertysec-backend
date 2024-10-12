import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column({ isPrimary: true })
  declare userId: string

  @column()
  declare amount: number

  @column()
  declare provider: 'PAYSTACK' | 'FLUTTERWAVE'

  @column()
  declare status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'INITIATED'

  @column()
  declare reference: string

  @column()
  declare providerResponse: string

  @column()
  declare paymentMethod: 'CARD' | 'BANK_TRANSFER' | 'WALLET'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @beforeCreate()
  static generateUUID(payment: Payment) {
    payment.id = uuidv4()
  }
}
