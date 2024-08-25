import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Category from './category.js'
import { v4 as uuidv4 } from 'uuid'
// import string from '@adonisjs/core/helpers/string'
// import { nanoid } from 'nanoid'
import type { IPropertyType } from '../interfaces/property.js'
import PropertyFile from './property_file.js'

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
  declare type: IPropertyType

  @column()
  declare bedrooms: number

  @column()
  declare bathrooms: number

  @column()
  declare toilets: number

  @column()
  declare address: string

  @column()
  declare street: string

  @column()
  declare price: number

  @column()
  declare currency: string

  @column()
  declare append?: string

  @column()
  declare stateId: string

  @column()
  declare cityId: string

  @column()
  declare description: string

  @column()
  declare status: 'draft' | 'published' | 'pending' | 'closed' | 'rejected'

  @column()
  declare meta?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasOne(() => User)
  declare user: HasOne<typeof User>

  @hasOne(() => Category)
  declare category: HasOne<typeof Category>

  @hasMany(() => PropertyFile)
  declare files: HasMany<typeof PropertyFile>

  @beforeCreate()
  static generate(property: Category) {
    property.id = uuidv4()

    // property.slug = string.slug(property.name + nanoid(5))
  }
}
