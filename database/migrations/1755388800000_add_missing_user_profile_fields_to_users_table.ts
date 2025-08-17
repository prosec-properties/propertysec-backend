import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
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
      table.string('next_of_kin_name').nullable()
      table.string('religion').nullable()

      // Financial information
      table.decimal('monthly_salary').nullable()
      table.string('bank_name').nullable()
      table.string('bank_account_number').nullable()
      table.string('bank_account_name').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('business_name')
      table.dropColumn('business_reg_no')
      table.dropColumn('business_address')

      table.dropColumn('nationality')
      table.dropColumn('state_of_residence')
      table.dropColumn('city_of_residence')
      table.dropColumn('home_address')
      table.dropColumn('state_of_origin')
      table.dropColumn('nin')
      table.dropColumn('bvn')
      table.dropColumn('next_of_kin_name')
      table.dropColumn('religion')

      table.dropColumn('monthly_salary')
      table.dropColumn('bank_name')
      table.dropColumn('bank_account_number')
      table.dropColumn('bank_account_name')
    })
  }
}
