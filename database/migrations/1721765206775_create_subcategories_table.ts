import { BaseSchema } from '@adonisjs/lucid/schema'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSchema {
  protected tableName = 'subcategories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4())
      table.string('category_id').notNullable()
      table.string('name').notNullable()
      table.string('description').nullable()
      table.string('slug').notNullable().unique()
      table.enum('status', ['active', 'inactive']).defaultTo('active')
      table.string('image').nullable()
      table.string('meta').nullable()
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      table.index(['name'], 'subcategory_name_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
