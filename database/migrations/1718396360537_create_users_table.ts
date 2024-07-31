import { BaseSchema } from '@adonisjs/lucid/schema'
import { v4 as uuidv4 } from 'uuid'
import { IUserRoleEnum } from '../../app/interface/user.js'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4())
      table.uuid('state').references('id').inTable('states')
      table.uuid('city').references('id').inTable('cities')
      table.string('full_name').notNullable()
      table.string('email').notNullable().unique()
      table.string('phone_number').nullable().unique()
      table
        .enum('auth_provider', ['email', 'google', 'facebook', 'twitter', 'other'])
        .notNullable()
        .defaultTo('email')
      table.enum('role', IUserRoleEnum).defaultTo('user')
      table.string('avatar_url')
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
