import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'plans'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().notNullable()
      table.string('name').notNullable()
      table.text('description').nullable()
      table.text('features').notNullable()
      table.decimal('price').notNullable()
      table.integer('duration').notNullable()
      table.integer('order').notNullable()
      table.enum('currency', ['NGN', 'GHS', 'ZAR', 'USD', 'PROSEC Credits']).defaultTo('NGN')
      table.integer('discont_percentage').nullable()
      table.text('meta').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
