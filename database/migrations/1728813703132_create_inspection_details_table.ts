import { BaseSchema } from '@adonisjs/lucid/schema'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSchema {
  protected tableName = 'inspection_details'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4())
      table.decimal('inspection_amount')
      table.enum('inspection_status', ['PENDING', 'COMPLETED'])
      table.text('inspection_report')
      table.uuid('user_id').references('id').inTable('users')
      table.uuid('property_id').references('id').inTable('properties')
      table.string('name')
      table.string('email') 
      table.string('phone_number')
      table.text('meta').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
