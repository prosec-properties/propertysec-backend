import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import string from '@adonisjs/core/helpers/string'
import { nanoid } from 'nanoid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare categoryId: string

  @column()
  declare subCategoryId: string

  @column()
  declare name: string

  @column()
  declare location: string

  @column()
  declare price: number

  @column()
  declare description: string

  @column()
  declare meta: string

  @column()
  declare status: 'active' | 'inactive' | 'cancelled' | 'draft' | 'unsubscribed' | 'other'

  @column()
  declare slug: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static generateUUID(model: Product) {
    model.id = uuidv4()
  }

  @beforeCreate()
  static generateSlug(model: Product) {
    model.slug = string.slug(model.name + nanoid(5))
  }

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
