import { BaseSchema } from '@adonisjs/lucid/schema'
import { v4 as uuidv4 } from 'uuid'
import { IUserRoleEnum } from '../../app/interfaces/user.js'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4())
      table.uuid('state_of_residence').references('id').inTable('states')
      table.uuid('city_of_residence').references('id').inTable('cities')
      table.string('nationality').nullable()

      table.string('full_name').notNullable()
      table.string('slug').notNullable().unique()
      table.string('email').notNullable().unique()
      table
        .enum('auth_provider', ['email', 'google', 'facebook', 'twitter', 'other'])
        .notNullable()
        .defaultTo('email')
      table.enum('role', IUserRoleEnum).defaultTo('user')
      table.string('avatar_url')
      table.string('home_address').nullable()
      table.string('password').notNullable()
      table.boolean('email_verified').notNullable().defaultTo(false)
      table.string('phone_number').nullable().unique()

      table.boolean('has_completed_profile').defaultTo(false)
      table.boolean('has_completed_registration').notNullable()

      table.string('business_address').nullable()
      table.string('business_name').nullable()
      table.string('business_reg_no').nullable()

      table.string('state_of_origin').nullable()
      table.string('nin').nullable()
      table.string('religion').nullable()
      table.string('bvn').nullable()
      table.string('next_of_kin_name').nullable()
      table.string('bank_name').nullable()
      table.string('bank_account_number').nullable()
      table.string('bank_account_name').nullable()
      table.float('monthly_salary').nullable()

      table.text('meta').nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
