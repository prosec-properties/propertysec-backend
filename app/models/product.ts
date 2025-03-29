import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Category from './category.js'
import SubCategory from './subcategory.js'
import type { IProductAvailability, IProductCondition, IProductStatus } from '#interfaces/product'
import ProductFile from './product_file.js'
import { v4 as uuidv4 } from 'uuid'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare price: number

  @column()
  declare condition: IProductCondition

  @column()
  declare status: IProductStatus

  @column()
  declare brand?: string

  @column()
  declare model?: string

  @column()
  declare specifications?: string | null

  @column()
  declare countryId: string

  @column()
  declare stateId: string

  @column()
  declare cityId: string

  @column()
  declare address: string

  @column()
  declare userId: string

  @column()
  declare categoryId: string

  @column()
  declare subcategoryId: string

  @column()
  declare negotiable: boolean

  @column()
  declare quantity: number

  @column()
  declare availability: IProductAvailability

  @column()
  declare views: number

  @column()
  declare affiliateId?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  @belongsTo(() => SubCategory)
  declare subcategory: BelongsTo<typeof SubCategory>

  @hasMany(() => ProductFile)
  declare files: HasMany<typeof ProductFile>

  @beforeCreate()
  static generateUUID(model: Product) {
    model.id = uuidv4()
  }
}
