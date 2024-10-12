import { DateTime } from 'luxon'
import {
  afterFetch,
  afterFind,
  BaseModel,
  beforeCreate,
  belongsTo,
  column,
} from '@adonisjs/lucid/orm'
import type { AcceptedCurrencies, TransactionStatus, TransactionType } from '#interfaces/payment'
import { v4 as uuidv4 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Payment from './payment.js'

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column({ serializeAs: 'userId' })
  declare userId: string

  @column({ serializeAs: 'transactionType' })
  declare transactionType: 'SUBSCRIPTION' | 'PROPERTY_INSPECTION' | 'LOAN_REPAYMENT'

  @column({ serializeAs: 'transactionTypeId' })
  declare transactionTypeId: string

  @column()
  declare amount: number

  @column({ serializeAs: 'actualAmount' })
  declare actualAmount: number

  @column()
  declare currency: AcceptedCurrencies

  @column()
  declare status: TransactionStatus

  @column()
  declare provider?: 'PAYSTACK' | 'FLUTTERWAVE'

  @column({ serializeAs: 'providerStatus' })
  declare providerStatus: string

  @column({ serializeAs: 'sessionId' })
  declare sessionId?: string

  @column({ serializeAs: null })
  declare providerResponse: string

  @column()
  declare type: TransactionType

  @column()
  declare date: string | null

  @column()
  declare narration?: string

  @column()
  declare reference: string

  @column()
  declare paymentId: string

  @column({ serializeAs: 'isVerified' })
  declare isVerified?: boolean

  @column({ serializeAs: 'verifyNarration' })
  declare verifyNarration?: string

  @column()
  declare meta?: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async generateId(data: Transaction) {
    if (!data.$dirty.id) {
      data.id = uuidv4()
    }
  }

  @afterFetch()
  static async setMeta(data: Transaction[]) {
    data.forEach((transaction) => {
      if (transaction.meta) {
        transaction.meta = JSON.parse(transaction.meta)
      }
    })
  }

  @afterFind()
  static async setMetaSingle(data: Transaction) {
    if (data.meta) {
      data.meta = JSON.parse(data.meta)
    }
  }

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Payment)
  declare payment: BelongsTo<typeof Payment>
}
