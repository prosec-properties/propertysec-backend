import { BaseSchema } from '@adonisjs/lucid/schema'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4())
      table.uuid('user_id').references('id').inTable('users')
      table.decimal('amount')
      table.enum('provider', ['PAYSTACK', 'FLUTTERWAVE'])
      table.string('reference')
      table.text('provider_response')
      table.enum('payment_method', ['CARD', 'BANK_TRANSFER', 'WALLET'])
      table.enum('status', ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED', 'INITIATED'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
