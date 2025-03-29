import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Products extends BaseSchema {
  protected tableName = 'categories'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('name').notNullable()
      table.string('slug').notNullable().unique()
      table.enum('type', ['product', 'property']).notNullable()
      table.enum('status', ['active', 'inactive']).notNullable().defaultTo('active')
      table.string('image').nullable()
      table.string('description').nullable()
      table.string('meta').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
