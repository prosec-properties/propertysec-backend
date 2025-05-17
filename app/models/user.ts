import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeCreate,
  beforeUpdate,
  belongsTo,
  column,
  hasMany,
} from '@adonisjs/lucid/orm'
import hash from '@adonisjs/core/services/hash'
import { AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
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

import { IStatus } from '#interfaces/general'
import Subscription from './subscription.js'

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

  // Business information
  @column()
  declare businessName: string | null

  @column()
  declare businessRegNo: string | null

  @column()
  declare businessAddress: string | null

  // Personal information
  @column()
  declare nationality: string | null

  @column()
  declare stateOfResidence: string | null

  @column()
  declare cityOfResidence: string | null

  @column()
  declare homeAddress: string | null

  @column()
  declare stateOfOrigin: string | null

  @column()
  declare nin: string | null

  @column()
  declare bvn: string | null

  @column()
  declare nextOfKin: string | null

  @column()
  declare religion: string | null

  // Financial information
  @column()
  declare monthlySalary: number | null

  @column()
  declare bankName: string | null

  @column()
  declare bankAccountNumber: string | null

  @column()
  declare bankAccountName: string | null

  // subscription

  @column()
  declare subscriptionId: string | null

  @column()
  declare subscriptionStatus: IStatus | null

  @column()
  declare subscriptionStartDate: string | null

  @column()
  declare subscriptionEndDate: string | null

  @column()
  declare buyerApproved: boolean

  // Metadata
  @column()
  declare meta: string | null

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

  @belongsTo(() => Subscription)
  declare subscription: BelongsTo<typeof Subscription>

  @beforeCreate()
  static async createSlug(user: User) {
    user.id = uuidv4()
    await this.generateSlug(user)
  }

  @beforeUpdate()
  static async updateSlug(user: User) {
    if (user.$dirty.fullName) {
      await this.generateSlug(user)
    }
  }

  private static async generateSlug(user: User) {
    const baseSlug = stringHelpers.slug(user.fullName.toLowerCase())
    let slug = `${baseSlug}-${nanoid(5)}`

    const query = User.query().where('slug', slug)
    if (user.$isPersisted) {
      query.whereNot('id', user.id)
    }

    const existingUser = await query.first()

    if (existingUser) {
      slug = `${baseSlug}-${nanoid(8)}`
    }

    user.slug = slug
  }
}
