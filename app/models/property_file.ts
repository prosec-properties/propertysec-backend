import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasOne } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import Property from './property.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import type { IFileType } from '#interfaces/file'

export default class PropertyFile extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare propertyId: string

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
  static generateUUID(model: PropertyFile) {
    model.id = uuidv4()
  }

  @hasOne(() => Property)
  declare property: HasOne<typeof Property>
}
