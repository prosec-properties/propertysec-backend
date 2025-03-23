import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'banks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.string('average_salary').notNullable()
      table.string('bank_name').notNullable()
      table.string('salary_account_number').notNullable()
      table.string('nin').notNullable()
      table.string('bvn').notNullable()
      table.uuid('context_id').notNullable()
      table.string('context_type').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}