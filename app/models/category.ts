import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import string from '@adonisjs/core/helpers/string'
import Subcategory from './subcategory.js'

export default class Category extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

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
    property.slug = string.slug(property.name)
  }

  @hasMany(() => Subcategory)
  declare subcategories: HasMany<typeof Subcategory>
}
