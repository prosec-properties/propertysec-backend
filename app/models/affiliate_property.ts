import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Affiliate extends BaseModel {
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
}
