import { DateTime } from 'luxon'
import { afterCreate, afterFetch, afterFind, afterUpdate, BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { TransferInvoicePdfContentTable } from '#interfaces/transactionPdf'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Subscription from './subscription.js'

export default class Invoice extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ serializeAs: 'userId' })
  declare userId: string

  @column()
  declare amount: number

  @column()
  declare vat: number

  @column()
  declare meta?: string

  @column()
  declare discount?: number

  @column({ serializeAs: 'isVerified' })
  declare isVerified: boolean

  @column({ serializeAs: 'verifiedBy' })
  declare verifiedBy?: string

  @column({ serializeAs: 'verifiedAt' })
  declare verifiedAt?: string

  @column({ serializeAs: 'planId' })
  declare planId?: string

  @column({ serializeAs: 'transactionId' })
  declare transactionId?: string

  @column({ serializeAs: 'subscriptionId' })
  declare subscriptionId?: string

  @column()
  declare invoiceData: {
    tableData: TransferInvoicePdfContentTable[]
    [key: string]: any
  }

  @column({ serializeAs: 'paymentId' })
  declare paymentId: string

  @column({ serializeAs: 'dueDate' })
  declare dueDate: string

  @column({ serializeAs: 'bankName' })
  declare bankName: string

  @column({ serializeAs: 'accountNumber' })
  declare accountNumber: string

  @column({ serializeAs: 'accountName' })
  declare accountName: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @afterFetch()
   static async afterFetchHook(_: Invoice[]) {
    this.deleteUnusedInvoiceData()
  }

  @afterFind()
   static async afterFindHook(_: Invoice) {
    this.deleteUnusedInvoiceData()
  }

  @afterCreate()
   static async afterCreateHook(_: Invoice) {
    this.deleteUnusedInvoiceData()
  }

  @afterUpdate()
   static async afterUpdateHook(_: Invoice) {
    this.deleteUnusedInvoiceData()
  }

  private static async deleteUnusedInvoiceData() {
    Invoice.query()
      .where('isVerified', false)
      .where('dueDate', '<', DateTime.now().minus({ days: 10 }).toISO() || '')
      .delete()
  }

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'verifiedBy',
  })
  declare admin: BelongsTo<typeof User>

  // @belongsTo(() => Plan)
  // declare plan: BelongsTo<typeof Plan>

  @belongsTo(() => Subscription)
  declare subscription: BelongsTo<typeof Subscription>
}