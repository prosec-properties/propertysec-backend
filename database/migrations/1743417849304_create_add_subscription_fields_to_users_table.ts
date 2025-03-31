import { GENERAL_STATUS_ENUM } from '#interfaces/general'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddSubscriptionFieldsToUsers extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('subscription_id').nullable()
      table
        .enum('subscription_status', Object.values(GENERAL_STATUS_ENUM))
        .nullable()
        .defaultTo('inactive')
      table.dateTime('subscription_start_date').nullable()
      table.dateTime('subscription_end_date').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('subscription_id')
      table.dropColumn('subscription_status')
      table.dropColumn('subscription_start_date')
      table.dropColumn('subscription_end_date')
    })
  }
}
