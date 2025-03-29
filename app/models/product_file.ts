import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import type { IFileType } from '#interfaces/file'

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
}
