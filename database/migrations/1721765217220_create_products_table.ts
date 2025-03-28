import { BaseSchema } from '@adonisjs/lucid/schema'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(uuidv4())
      table.uuid('country').references('id').inTable('countries').onDelete('CASCADE')
      table.uuid('state').references('id').inTable('states').onDelete('CASCADE')
      table.uuid('city').references('id').inTable('cities').onDelete('CASCADE')      
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.uuid('category_id').references('id').inTable('categories').onDelete('CASCADE')
      table.uuid('sub_category_id').references('id').inTable('sub_categories').onDelete('CASCADE')

      table.string('title').notNullable()
      table.text('description').notNullable()
      table.decimal('price', 12, 2).notNullable()
      table.enum('condition', ['new', 'used', 'refurbished']).notNullable()
      table.enum('status', ['active', 'sold', 'inactive']).defaultTo('active')
      table.string('brand')
      table.string('model')
      table.string('specifications')
      table.boolean('negotiable').defaultTo(true)
      table.integer('quantity').defaultTo(1)
      table.integer('views').defaultTo(0)
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['category_id'], 'category_id_index')
      table.index(['user_id'], 'user_id_index')
      table.index(['location'], 'price_index')
      table.index(['title'], 'name_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
