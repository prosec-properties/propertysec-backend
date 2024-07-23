import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import hash from '@adonisjs/core/services/hash'
import { AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Property from './property.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare fullname: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare emailVerified: boolean

  @column()
  declare phoneNumber: string

  @column()
  declare role: 'landlord' | 'buyer' | 'affiliate' | 'developer' | 'lawyer' | 'admin' | 'other'

  @column()
  declare avatarUrl: string

  @column()
  declare state: string

  @column()
  declare city: string

  @column()
  declare address: string

  @column()
  declare meta: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  currentAccessToken?: AccessToken

  static accessTokens = DbAccessTokensProvider.forModel(User)

  @hasMany(() => Property)
  declare properties: HasMany<typeof Property>
}
