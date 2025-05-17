import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Business information
      table.string('business_name').nullable()
      table.string('business_reg_no').nullable()
      table.string('business_address').nullable()

      // Personal information
      table.string('nationality').nullable()
      table.string('state_of_residence').nullable()
      table.string('city_of_residence').nullable()
      table.string('home_address').nullable()
      table.string('state_of_origin').nullable()
      table.string('nin').nullable()
      table.string('bvn').nullable()
      table.string('next_of_kin').nullable()
      table.string('religion').nullable()

      // Financial information
      table.float('monthly_salary').nullable()
      table.string('bank_name').nullable()
      table.string('bank_account_number').nullable()
      table.string('bank_account_name').nullable()

      // Metadata
      table.text('meta').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
