import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasOne } from '@adonisjs/lucid/orm'
import State from './state.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'

export default class City extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare isActive: boolean

  @column()
  declare stateId: string

  @column()
  declare meta: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static generateId(property: City) {
    property.id = uuidv4()
  }

  @hasOne(() => State)
  declare state: HasOne<typeof State>
}
