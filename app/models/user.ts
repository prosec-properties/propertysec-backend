import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import hash from '@adonisjs/core/services/hash'
import { AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import type { IUserRole } from '../interfaces/user.js'
import { v4 as uuidv4 } from 'uuid'
import stringHelpers from '@adonisjs/core/helpers/string'
import { nanoid } from 'nanoid'

// Import models
import Property from './property.js'
import PropertyAccessRequest from './property_access_request.js'
import ProfileFile from './profile_file.js'
import Transaction from './transaction.js'
import Loan from './loan.js'
import Guarantor from './guarantor.js'
import Employment from './employment.js'
import Landlord from './landlord.js'
import LoanRequest from './loan_request.js'
import Bank from './bank.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare emailVerified: boolean

  @column()
  declare authProvider: string

  @column()
  declare role: IUserRole

  @column()
  declare fullName: string

  @column()
  declare slug: string

  @column()
  declare phoneNumber: string

  @column()
  declare avatarUrl: string

  @column()
  declare isVerified: boolean

  @column()
  declare hasCompletedProfile: boolean

  @column()
  declare hasCompletedRegistration: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  currentAccessToken?: AccessToken

  static accessTokens = DbAccessTokensProvider.forModel(User)

  @beforeCreate()
  static addOns(user: User) {
    user.id = uuidv4()
    user.slug = stringHelpers.slug(`${user.fullName.toLowerCase()}-${nanoid(5)}`)
  }

  // Relationships
  @hasMany(() => Property)
  declare properties: HasMany<typeof Property>

  @hasMany(() => PropertyAccessRequest)
  declare propertyAccessRequests: HasMany<typeof PropertyAccessRequest>

  @hasMany(() => ProfileFile)
  declare profileFiles: HasMany<typeof ProfileFile>

  @hasMany(() => Transaction)
  declare transactions: HasMany<typeof Transaction>

  @hasMany(() => Loan)
  declare loans: HasMany<typeof Loan>

  @hasMany(() => Guarantor)
  declare guarantors: HasMany<typeof Guarantor>

  @hasMany(() => Employment)
  declare employments: HasMany<typeof Employment>

  @hasMany(() => Landlord)
  declare landlords: HasMany<typeof Landlord>

  @hasMany(() => LoanRequest)
  declare loanRequests: HasMany<typeof LoanRequest>

  @hasMany(() => Bank)
  declare banks: HasMany<typeof Bank>
}
