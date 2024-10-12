import { BaseSchema } from '@adonisjs/lucid/schema'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4())
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.enum('transaction_type', ['SUBSCRIPTION', 'PROPERTY_INSPECTION', 'LOAN_REPAYMENT ']).notNullable()
      table.uuid('transaction_type_id').notNullable()
      table.uuid('payment_id').notNullable()
      table.decimal('amount').notNullable()
      table.decimal('actual_amount').notNullable()
      table.string('currency').notNullable()
      table.enum('status', ['PENDING', 'SUCCESS', 'FAIL', 'INITIALIZE']).notNullable()
      table.string('provider').notNullable().defaultTo('paystack')
      table.string('provider_status').notNullable()
      table.string('session_id').nullable()
      table.text('provider_response').nullable()
      table.string('type').notNullable()
      table.string('date').notNullable()
      table.string('narration').nullable()
      table.string('reference').notNullable().unique()
      table.boolean('is_verified').notNullable().defaultTo(false)
      table.string('verify_narration').nullable()
      table.text('meta').nullable()
      table.uuid('wallet_id').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}