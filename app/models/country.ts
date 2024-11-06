import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import State from './state.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Country extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare capital: string

  @column()
  declare region: string

  @column()
  declare subregion: string

  @column()
  declare emoji: string

  @column()
  declare currency: string

  @column()
  declare currencySymbol: string

  @column()
  declare phoneCode: string

  @column()
  declare iso: string

  @column()
  declare meta?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
  
  @hasMany(() => State)
  declare states: HasMany<typeof State>
}
