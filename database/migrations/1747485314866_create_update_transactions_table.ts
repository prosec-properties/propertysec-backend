import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('payment_id').nullable().alter()
      table.uuid('transaction_type_id').nullable().alter()

      table.string('slug').nullable()
      table.uuid('property_id').nullable()

    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}