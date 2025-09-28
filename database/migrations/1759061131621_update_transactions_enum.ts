import { BaseSchema } from '@adonisjs/lucid/schema'

export default class UpdateTransactionsEnum extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    // First, drop the existing constraint
    this.schema.raw(`
      ALTER TABLE ${this.tableName} 
      DROP CONSTRAINT IF EXISTS transactions_transaction_type_check
    `)

    // Then alter the column to use the new enum values
    this.schema.raw(`
      ALTER TABLE ${this.tableName} 
      ALTER COLUMN transaction_type 
      TYPE TEXT
    `)

    // Add a new check constraint with the updated values
    this.schema.raw(`
      ALTER TABLE ${this.tableName} 
      ADD CONSTRAINT transactions_transaction_type_check 
      CHECK (transaction_type IN ('SUBSCRIPTION', 'PROPERTY_INSPECTION', 'LOAN_REPAYMENT', 'PROPERTY_PURCHASE', 'REFUND'))
    `)
  }

  async down() {
    // Drop the new constraint
    this.schema.raw(`
      ALTER TABLE ${this.tableName} 
      DROP CONSTRAINT IF EXISTS transactions_transaction_type_check
    `)

    // Add back the old constraint
    this.schema.raw(`
      ALTER TABLE ${this.tableName} 
      ADD CONSTRAINT transactions_transaction_type_check 
      CHECK (transaction_type IN ('SUBSCRIPTION', 'PROPERTY_INSPECTION', 'LOAN_REPAYMENT'))
    `)
  }
}