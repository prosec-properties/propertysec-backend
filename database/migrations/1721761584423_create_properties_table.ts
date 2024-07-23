import { BaseSchema } from '@adonisjs/lucid/schema'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSchema {
  protected tableName = 'properties'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4())
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.string('title').notNullable()
      table.uuid('category_id').references('id').inTable('categories').onDelete('CASCADE')
      table.enum('type', ['sale', 'rent']).notNullable()
      table.integer('bedrooms').notNullable()
      table.integer('bathrooms').notNullable()
      table.integer('toilets').notNullable()
      table.string('property_address').notNullable()
      table.string('street').notNullable()
      table.float('price').notNullable()
      table.string('currency').notNullable()
      table.string('append').nullable()
      table.text('description').notNullable()
      table
        .enum('status', ['draft', 'published', 'pending', 'closed', 'rejected'])
        .defaultTo('active')
      table.text('meta').nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      table.index(['title'], 'title_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
