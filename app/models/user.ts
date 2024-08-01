import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import hash from '@adonisjs/core/services/hash'
import { AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Property from './property.js'
import type { IUserRole } from '../interface/user.js'
import { v4 as uuidv4 } from 'uuid'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare fullName: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare emailVerified: boolean

  @column()
  declare phoneNumber: string

  @column()
  declare role: IUserRole

  @column()
  declare avatarUrl: string

  @column()
  declare state: string

  @column()
  declare city: string

  @column()
  declare address: string

  @column()
  declare authProvider: string

  @column()
  declare hasCompletedProfile: boolean

  @column()
  declare hasCompletedRegistration: boolean

  @column()
  declare meta: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  currentAccessToken?: AccessToken

  static accessTokens = DbAccessTokensProvider.forModel(User)

  @beforeCreate()
  static generateId(property: User) {
    property.id = uuidv4()
  }

  @hasMany(() => Property)
  declare properties: HasMany<typeof Property>
}
