import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Products extends BaseSchema {
  protected tableName = 'products'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Primary Key
      table.uuid('id').primary()

      // Foreign Keys
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.uuid('category_id').references('id').inTable('categories').onDelete('SET NULL')
      table
        .uuid('sub_category_id')
        .references('id')
        .inTable('sub_categories')
        .onDelete('SET NULL')
        .nullable()

      // Product Information
      table.string('title').notNullable()
      table.string('sku').nullable()
      table.string('brand').nullable()
      table.string('model').nullable()
      table
        .enum('condition', [
          'new',
          'like_new',
          'used_good',
          'used_fair',
          'refurbished',
          'for_parts',
        ])
        .notNullable()

      // Pricing & Inventory
      table.decimal('price', 12, 2).notNullable()
      table.string('currency', 3).notNullable()
      table.integer('quantity').unsigned().notNullable()
      table.boolean('is_negotiable').defaultTo(false)
      table.boolean('has_discount').defaultTo(false)
      table.decimal('original_price', 12, 2).nullable()

      // Product Details
      table.text('description').notNullable()
      table.text('specifications').nullable()
      table.string('warranty').nullable()
      table.string('warranty_period').nullable()

      // Physical Attributes
      table.string('size').nullable()
      table.string('color').nullable()
      table.string('material').nullable()
      table.decimal('weight', 10, 2).nullable() // in kg
      table.string('dimensions').nullable() // "LxWxH" format

      // Digital Products
      table.boolean('is_digital').defaultTo(false)
      table.string('download_url').nullable()

      // Location
      table.string('location').notNullable()
      table.string('city').notNullable()
      table.string('country').notNullable()

      // Status & Visibility
      table.enum('status', ['draft', 'active', 'sold', 'reserved', 'inactive']).notNullable()
      table.boolean('is_featured').defaultTo(false)
      table.integer('views').unsigned().defaultTo(0)

      // System
      table.string('slug').notNullable().unique()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      table.timestamp('published_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
