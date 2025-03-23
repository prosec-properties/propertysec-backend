import { BaseSchema } from '@adonisjs/lucid/schema'
import { v4 as uuidv4 } from 'uuid'
import { IUserRoleEnum } from '../../app/interfaces/user.js'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Primary and Authentication Info
      table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4())
      table.string('email').notNullable().unique()
      table.string('password').notNullable()
      table.boolean('email_verified').notNullable().defaultTo(false)
      table.enum('auth_provider', ['email', 'google', 'facebook', 'twitter', 'other'])
        .notNullable()
        .defaultTo('email')
      table.enum('role', IUserRoleEnum).defaultTo('user')

      // Basic Personal Information
      table.string('full_name').notNullable()
      table.string('slug').notNullable().unique()
      table.string('phone_number').nullable()
      table.string('avatar_url').nullable()

      // Status flags
      table.boolean('is_verified').defaultTo(false)
      table.boolean('has_completed_profile').defaultTo(false)
      table.boolean('has_completed_registration').notNullable()

      // Timestamps
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
