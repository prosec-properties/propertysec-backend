import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasOne } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import string from '@adonisjs/core/helpers/string'
import Category from './category.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'

export default class Subcategory extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare categoryId: string

  @column()
  declare categoryName: string

  @column()
  declare name: string

  @column()
  declare slug: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static generateUUID(model: Subcategory) {
    model.id = uuidv4()
  }

  @beforeCreate()
  static generateSlug(model: Subcategory) {
    model.slug = string.slug(model.name)
  }

  @hasOne(() => Category)
  declare category: HasOne<typeof Category>
}
