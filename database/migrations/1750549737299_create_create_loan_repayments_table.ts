import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'loan_repayments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('loan_id').notNullable().references('id').inTable('loans').onDelete('CASCADE')
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.decimal('repayment_amount', 12, 2).notNullable()
      table.enum('repayment_type', ['PARTIAL', 'FULL', 'INTEREST', 'PRINCIPAL']).notNullable()
      table.enum('payment_method', ['CARD', 'BANK_TRANSFER', 'WALLET', 'CASH']).notNullable()
      table.string('payment_reference').notNullable()
      table.enum('payment_provider', ['PAYSTACK', 'FLUTTERWAVE', 'MANUAL']).notNullable()
      table.enum('repayment_status', ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED']).notNullable()
      table.decimal('outstanding_balance', 12, 2).notNullable()
      table.decimal('principal_amount', 12, 2).defaultTo(0)
      table.decimal('interest_amount', 12, 2).defaultTo(0)
      table.decimal('penalty_amount', 12, 2).nullable()
      table.text('meta').nullable()
      table.timestamp('due_date').nullable()
      table.timestamp('repayment_date').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['loan_id'])
      table.index(['user_id'])
      table.index(['repayment_status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}