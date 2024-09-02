import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'property_access_requests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().notNullable()
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table
        .uuid('property_id')
        .notNullable()
        .references('id')
        .inTable('properties')
        .onDelete('CASCADE')
      table.boolean('approved').defaultTo(false)
      table.uuid('approved_by').references('id').inTable('users').onDelete('CASCADE')
      table.timestamp('approved_at')
      table.text('meta').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
