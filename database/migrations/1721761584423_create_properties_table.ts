import { BaseSchema } from '@adonisjs/lucid/schema'
import { v4 as uuidv4 } from 'uuid'
import { PROPERTY_TYPE_ENUMS, PROPERTY_STATUS_ENUMS } from '#interfaces/property'
import { CURRENCIES_ENUM } from '#interfaces/payment'
import { PRODUCT_AVAILABILITY_ENUMS } from '#interfaces/product'

export default class extends BaseSchema {
  protected tableName = 'properties'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4())
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.string('affiliate_id').nullable()
      table.integer('country_id').references('id').inTable('countries').onDelete('CASCADE')
      table.integer('state_id').references('id').inTable('states')
      table.integer('city_id').references('id').inTable('cities').nullable()
      table.string('address').notNullable()

      table.string('title').notNullable()
      table.uuid('category_id').references('id').inTable('categories')
      table.enum('type', PROPERTY_TYPE_ENUMS).notNullable()
      table.integer('bedrooms').notNullable()
      table.integer('bathrooms').notNullable()
      table.integer('toilets').notNullable()
      table.string('street').notNullable()
      table.float('price').notNullable()
      table.enum('currency', CURRENCIES_ENUM).notNullable()
      table.string('append').nullable()
      table.text('description').notNullable()
      table.string('views').defaultTo('0')
      table.enum('availability', Object.values(PRODUCT_AVAILABILITY_ENUMS)).defaultTo('available')
      table.enum('status', PROPERTY_STATUS_ENUMS).defaultTo('active')
      table.string('default_image_url').nullable()
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
