import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'wallets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table.bigInteger('balance').notNullable().defaultTo(0)
      table.bigInteger('ledger_balance').notNullable().defaultTo(0)
      table.bigInteger('total_balance').notNullable().defaultTo(0)
      table.bigInteger('total_spent').notNullable().defaultTo(0)
      table.text('meta').nullable()
      table.string('currency').notNullable().defaultTo('NGN')
      table.string('type').notNullable().defaultTo('main')
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}