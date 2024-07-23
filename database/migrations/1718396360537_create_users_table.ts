import { BaseSchema } from '@adonisjs/lucid/schema'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4())
      table.string('full_name').notNullable()
      table.string('email').notNullable().unique()
      table.string('phone_number').notNullable().unique()
      table
        .enum('role', ['landlord', 'buyer', 'affiliate', 'developer', 'lawyer', 'admin', 'other'])
        .defaultTo('user')
      table.string('avatar_url')
      table.string('state').references('state').inTable('states')
      table.string('city').references('city').inTable('cities')
      table.string('full_address')
      table.string('password').notNullable()
      table.boolean('email_verified').notNullable().defaultTo(false)
      table.text('meta').nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
