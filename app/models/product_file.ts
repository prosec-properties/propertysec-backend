import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import type { IFileType } from '#interfaces/file'
import { v4 as uuidv4 } from 'uuid'


export default class ProductFile extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare productId: string

  @column()
  declare fileName: string

  @column()
  declare fileUrl: string

  @column()
  declare fileType: IFileType

  @column()
  declare meta?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static generateUUID(model: ProductFile) {
    model.id = uuidv4()
  }  
}
