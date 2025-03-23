import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'guarantors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('email').notNullable()
      table.string('home_address').notNullable()
      table.string('office_address').notNullable()
      table.string('phone_number').notNullable()
      table.uuid('context_id').notNullable()
      table.string('context_type').notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}