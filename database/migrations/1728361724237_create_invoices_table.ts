import { BaseSchema } from '@adonisjs/lucid/schema'
import { v4 as uuidv4 } from 'uuid'


export default class extends BaseSchema {
  protected tableName = 'invoices'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4())
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.bigint('amount').notNullable()
      table.bigint('vat').notNullable()
      table.bigint('discount').nullable()
      table.string('payment_id').notNullable().unique()
      table.boolean('is_verified').defaultTo(false)
      table.uuid('verified_by').nullable()
      table.string('verified_at').nullable()
      table.string('due_date').notNullable()
      table.string('bank_name').notNullable()
      table.string('account_number').notNullable()
      table.string('account_name').notNullable()
      table.jsonb('invoice_data').notNullable()
      table.text('meta').nullable()
      table.uuid('subscription_id').nullable()
      table.uuid('transaction_id').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}