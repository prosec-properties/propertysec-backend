import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Country from './country.js'
import City from './city.js'

export interface ICities {
  id: number
  name: string
  latitude: string
  longitude: string
}
export default class State extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare stateCode: string | null

  @column()
  declare latitude: string | null

  @column()
  declare longitude: string | null

  @column()
  declare countryId: number

  @column()
  declare meta?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasOne(() => Country)
  declare country: HasOne<typeof Country>

  @hasMany(() => City)
  declare cities: HasMany<typeof City>
}
