import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'countries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments().primary()
      table.string('name').notNullable()
      table.string('capital').notNullable()
      table.string('region').notNullable()
      table.string('subregion').notNullable()
      table.string('emoji').notNullable()
      table.string('currency').notNullable()
      table.string('currency_symbol').notNullable()
      table.string('phone_code').notNullable()
      table.string('iso').notNullable

      table.text('meta').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
