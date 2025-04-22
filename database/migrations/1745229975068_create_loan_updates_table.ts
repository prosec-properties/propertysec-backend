import { LOAN_AMOUNT_ENUM, LOAN_STATUS_ENUM } from '#interfaces/loan'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'loans'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('status', Object.values(LOAN_STATUS_ENUM))
      table.enum('loan_amount', Object.values(LOAN_AMOUNT_ENUM))
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
