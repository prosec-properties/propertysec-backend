import { BaseSchema } from '@adonisjs/lucid/schema'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSchema {
  protected tableName = 'loan_applicants'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4())
      table.uuid('user_id').references('id').inTable('users')
      table.string('next_of_kin').nullable()

      // Company Details
      table.string('company_address').nullable()
      table.string('company_name').nullable()
      table.string('position_in_company').nullable()
      table.string('company_phone_number').nullable()
      table.string('company_email').nullable()

      // Apartment Details
      table.integer('years_in_apartment').nullable()
      table.integer('number_of_rooms').nullable()
      table.string('reason_for_funds').nullable()

      // Landlord Details
      table.string('landlord_name').nullable()
      table.string('landlord_phone_number').nullable()
      table.string('landlord_email').nullable()
      table.string('landlord_address').nullable()
      table.string('landlord_bank_name').nullable()
      table.string('landlord_bank_account_number').nullable()
      table.string('landlord_bank_account_name').nullable()

      // Guarantor Details
      table.string('guarantor_name').nullable()
      table.string('guarantor_phone_number').nullable()
      table.string('guarantor_email').nullable()
      table.string('guarantor_home_address').nullable()
      table.string('guarantor_office_address').nullable()

      table.text('meta').nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
