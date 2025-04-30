import { LOAN_AMOUNT_ENUM, LOAN_DURATION_ENUM, LOAN_STATUS_ENUM } from '#interfaces/loan'
import { BaseSchema } from '@adonisjs/lucid/schema'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSchema {
  protected tableName = 'loans'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4())
      table.uuid('user_id').references('id').inTable('users')
      table.enum('loan_amount', Object.values(LOAN_AMOUNT_ENUM))
      table.float('interest_rate')
      table.enum('loan_duration', Object.values(LOAN_DURATION_ENUM))
     table.enum('loan_status', Object.values(LOAN_STATUS_ENUM))
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
