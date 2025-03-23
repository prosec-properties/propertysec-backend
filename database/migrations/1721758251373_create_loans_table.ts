import { BaseSchema } from '@adonisjs/lucid/schema'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSchema {
  protected tableName = 'loans'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4())
      table.enum('loan_amount', ['1000', '5000', '10000', '20000', '30000', '40000', '50000', '100000'])
      table.float('interest_rate')
      table.enum('loan_duration', ['1 month', '3 months', '6 months', '12 months'])
      table.enum('loan_status', ['pending', 'approved', 'rejected', 'disbursed'])
      table.string('reason_for_funds')
      table.boolean('has_completed_form').defaultTo(false)
      table.text('meta').nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
