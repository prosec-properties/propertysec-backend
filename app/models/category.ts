import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, beforeUpdate, column, hasMany } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import string from '@adonisjs/core/helpers/string'
import Subcategory from './subcategory.js'
import type { ICategoryType, IStatus } from '#interfaces/general'

export default class Category extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare type: ICategoryType

  @column()
  declare status: IStatus

  @column()
  declare slug: string

  @column()
  declare meta?: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async generateUUID(category: Category) {
    if (!category.id) {
      category.id = uuidv4()
    }
  }

  @beforeCreate()
  static async generateSlug(category: Category) {
    await this.ensureUniqueSlug(category)
  }

  @beforeUpdate()
  static async updateSlug(category: Category) {
    if (category.$dirty.name) {
      await this.ensureUniqueSlug(category)
    }
  }

  private static async ensureUniqueSlug(category: Category) {
    const baseSlug = string.slug(category.name.toLowerCase())
    let slug = baseSlug
    let counter = 1

    while (true) {
      const existing = await Category.query()
        .where('slug', slug)
        .andWhereNot('id', category.id || '')
        .first()

      if (!existing) break

      slug = `${baseSlug}-${counter}`
      counter++
    }

    category.slug = slug
  }

  @hasMany(() => Subcategory)
  declare subcategories: HasMany<typeof Subcategory>
}
