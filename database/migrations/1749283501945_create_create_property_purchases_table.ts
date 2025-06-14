import { BaseSchema } from '@adonisjs/lucid/schema'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSchema {
  protected tableName = 'property_purchases'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4())
      table.uuid('user_id').references('id').inTable('users').notNullable()
      table.uuid('property_id').references('id').inTable('properties').notNullable()
      table.decimal('purchase_amount', 15, 2).notNullable()
      table.string('currency', 3).defaultTo('NGN')
      table.enum('purchase_status', ['PENDING', 'COMPLETED', 'CANCELLED']).defaultTo('PENDING')
      table.string('transaction_reference').notNullable()
      table.string('buyer_name').notNullable()
      table.string('buyer_email').notNullable()
      table.string('buyer_phone').notNullable()
      table.text('meta').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}