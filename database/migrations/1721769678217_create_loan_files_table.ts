import { BaseSchema } from '@adonisjs/lucid/schema'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSchema {
  protected tableName = 'loan_files'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4())
      table.uuid('loan_id').references('id').inTable('loans').nullable()
      table.uuid('application_id').references('id').inTable('loan_applications').nullable()
      table
        .enum('file_type', [
          'passport',
          'utility_bill',
          'bank_statement',
          'nin',
          'bvn',
          'salary_slip',
        ])
        .notNullable()
      table.enum('media_type', ['image', 'other']).notNullable().defaultTo('image')
      table.string('file_url').notNullable()
      table.string('file_name').nullable()
      table.text('meta').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
