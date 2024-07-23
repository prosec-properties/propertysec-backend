import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Category from './category.js'
import { v4 as uuidv4 } from 'uuid'
import string from '@adonisjs/core/helpers/string'
import { nanoid } from 'nanoid'

export default class Property extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare title: string

  @column()
  declare categoryId: string

  @column()
  declare type: 'sale' | 'rent'

  @column()
  declare bedrooms: number

  @column()
  declare bathrooms: number

  @column()
  declare toilets: number

  @column()
  declare property_address: string

  @column()
  declare street: string

  @column()
  declare price: number

  @column()
  declare currency: string

  @column()
  declare append: string

  @column()
  declare description: string

  @column()
  declare status: 'draft' | 'published' | 'pending' | 'closed' | 'rejected'

  @column()
  declare slug: string

  @column()
  declare meta: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static generateId(property: Category) {
    property.id = uuidv4()
  }

  @beforeCreate()
  static generateSlug(property: Category) {
    property.slug = string.slug(property.name + nanoid(5))
  }

  @hasOne(() => User)
  declare user: HasOne<typeof User>

  @hasOne(() => Category)
  declare category: HasOne<typeof Category>
}
