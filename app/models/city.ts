import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import State from './state.js'
import type {  HasOne } from '@adonisjs/lucid/types/relations'

export default class City extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare stateCode: string | null

  @column()
  declare stateId: number

  @column()
  declare countryId: number

  @column()
  declare countryCode: string

  @column()
  declare countryName: string

  @column()
  declare latitude: string | null

  @column()
  declare longitude: string | null

  @column()
  declare type: string | null

  @column()
  declare meta: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasOne(() => State)
  declare state: HasOne<typeof State>
}
