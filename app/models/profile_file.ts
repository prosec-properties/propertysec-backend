import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'

export default class ProfileFile extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare fileUrl: string

  @column()
  declare fileName: string

  @column()
  declare fileType: 'image' | 'video' | 'other'

  @column()
  declare fileCategory:
    | 'passport'
    | 'power_of_attorney'
    | 'identification'
    | 'approval_agreement'
    | 'other'

  @column()
  declare meta?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static generatId(file: ProfileFile) {
    file.id = uuidv4()
  }
}
