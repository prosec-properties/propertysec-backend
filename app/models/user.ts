import { DateTime } from 'luxon'
import { afterFetch, BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import hash from '@adonisjs/core/services/hash'
import { AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Property from './property.js'
import type { IUserRole } from '../interfaces/user.js'
import { v4 as uuidv4 } from 'uuid'
import stringHelpers from '@adonisjs/core/helpers/string'
import { nanoid } from 'nanoid'
import PropertyAccessRequest from './property_access_request.js'
import ProfileFile from './profile_file.js'
import Transaction from './transaction.js'

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
  declare slug: string

  @column()
  declare businessName?: string

  @column()
  declare businessRegNo?: string

  @column()
  declare businessAddress?: string

  @column()
  declare stateOfResidence: string

  @column()
  declare cityOfResidence: string

  @column()
  declare homeAddress: string

  @column()
  declare stateOfOrigin?: string

  @column()
  declare monthlySalary: number

  @column()
  declare bankName: string

  @column()
  declare bankAccountNumber: string

  @column()
  declare bankAccountName: string

  @column()
  declare nextOfKin: string

  @column()
  declare religion: string

  @column()
  declare nin?: string

  @column()
  declare bvn: string

  @column()
  declare nationality?: string

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
  static addOns(property: User) {
    property.id = uuidv4()

    property.slug = stringHelpers.slug(`${property.fullName.toLowerCase()}-${nanoid(5)}`)
  }

  @afterFetch()
  static async fetchUserProperties(query: User) {
    query.preload('propertyAccessRequests')
  }

  @hasMany(() => Property)
  declare properties: HasMany<typeof Property>

  @hasMany(() => PropertyAccessRequest, {
    onQuery: (query) => query.where('approved', true),
  })
  declare propertyAccessRequests: HasMany<typeof PropertyAccessRequest>

  @hasMany(() => ProfileFile)
  declare profileFiles: HasMany<typeof ProfileFile>

  @hasMany(() => Transaction)
  declare transactions: HasMany<typeof Transaction>
}
