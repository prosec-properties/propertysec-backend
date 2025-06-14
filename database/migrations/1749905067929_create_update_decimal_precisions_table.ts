import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Update transactions table decimal fields
    this.schema.alterTable('transactions', (table) => {
      table.decimal('amount', 15, 2).alter()
      table.decimal('actual_amount', 15, 2).alter()
    })

    // Update inspection_details table decimal fields
    this.schema.alterTable('inspection_details', (table) => {
      table.decimal('inspection_amount', 15, 2).alter()
    })

    // Update payments table decimal fields
    this.schema.alterTable('payments', (table) => {
      table.decimal('amount', 15, 2).alter()
    })

    // Update products table decimal fields
    this.schema.alterTable('products', (table) => {
      table.decimal('price', 15, 2).alter()
    })

    // Update subscriptions table decimal fields
    this.schema.alterTable('subscriptions', (table) => {
      table.decimal('total_price', 15, 2).alter()
    })

    // Update plans table decimal fields
    this.schema.alterTable('plans', (table) => {
      table.decimal('price', 15, 2).alter()
    })
  }

  async down() {
    // Revert back to default decimal precision (8,2)
    this.schema.alterTable('transactions', (table) => {
      table.decimal('amount').alter()
      table.decimal('actual_amount').alter()
    })

    this.schema.alterTable('inspection_details', (table) => {
      table.decimal('inspection_amount').alter()
    })

    this.schema.alterTable('payments', (table) => {
      table.decimal('amount').alter()
    })

    this.schema.alterTable('products', (table) => {
      table.decimal('price').alter()
    })

    this.schema.alterTable('subscriptions', (table) => {
      table.decimal('total_price').alter()
    })

    this.schema.alterTable('plans', (table) => {
      table.decimal('price').alter()
    })
  }
}