import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'subscriptions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().notNullable()
      table.uuid('user_id').references('id').inTable('users').notNullable()
      table.uuid('plan_id').references('id').inTable('plans').notNullable()
      table.date('start_date').notNullable()
      table.date('end_date').notNullable()
      table.decimal('total_price').notNullable()
      table.text('meta').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}