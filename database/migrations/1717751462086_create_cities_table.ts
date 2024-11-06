import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name').notNullable()
      table.integer('country_id').references('id').inTable('countries').onDelete('CASCADE')
      table.integer('state_id').references('id').inTable('states').onDelete('CASCADE')
      table.string('state_code')
      table.string('country_name')
      table.string('country_code')
      table.string('latitude').nullable()
      table.string('longitude').nullable()
      table.string('type').nullable()

      table.text('meta').nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
