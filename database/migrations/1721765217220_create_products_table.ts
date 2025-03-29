import { PRODUCT_CONDITION_ENUMS, PRODUCT_STATUS_ENUMS } from '#interfaces/product'
import { BaseSchema } from '@adonisjs/lucid/schema'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(uuidv4())
      table.integer('country_id').references('id').inTable('countries').onDelete('CASCADE')
      table.integer('state_id').references('id').inTable('states')
      table.integer('city_id').references('id').inTable('cities')
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.uuid('category_id').references('id').inTable('categories').onDelete('CASCADE')
      table.uuid('subcategory_id').references('id').inTable('subcategories').onDelete('CASCADE')

      table.string('title').notNullable()
      table.text('description').notNullable()
      table.decimal('price').notNullable()
      table.enum('condition', Object.values(PRODUCT_CONDITION_ENUMS)).defaultTo('not_applicable')
      table.enum('status', Object.values(PRODUCT_STATUS_ENUMS)).defaultTo('active')
      table.string('brand').nullable()
      table.string('model').nullable()
      table.string('specifications').nullable()
      table.boolean('negotiable').defaultTo(true)
      table.integer('quantity').defaultTo(1)
      table.integer('views').defaultTo(0)
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['category_id'], 'category_id_index')
      table.index(['user_id'], 'user_id_index')
      table.index(['title'], 'name_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
