import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, beforeUpdate, column, hasOne } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import string from '@adonisjs/core/helpers/string'
import Category from './category.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import type { IStatus } from '#interfaces/general'

export default class Subcategory extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare categoryId: string

  @column()
  declare name: string

  @column()
  declare status: IStatus

  @column()
  declare image?: string | null

  @column()
  declare meta?: string | null

  @column()
  declare description: string | null  

  @column()
  declare slug: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async generateUUID(model: Subcategory) {
    if (!model.id) {
      model.id = uuidv4()
    }
  }

  @beforeCreate()
  static async generateSlug(model: Subcategory) {
    await this.ensureUniqueSlug(model)
  }

  @beforeUpdate()
  static async updateSlug(model: Subcategory) {
    if (model.$dirty.name) {
      await this.ensureUniqueSlug(model)
    }
  }

  private static async ensureUniqueSlug(model: Subcategory) {
    const baseSlug = string.slug(model.name)
    let slug = baseSlug
    let counter = 1

    while (true) {
      const existing = await Subcategory.query()
        .where('slug', slug)
        .andWhereNot('id', model.id || '')
        .first()

      if (!existing) break

      slug = `${baseSlug}-${counter}`
      counter++
    }

    model.slug = slug
  }

  @hasOne(() => Category)
  declare category: HasOne<typeof Category>
}