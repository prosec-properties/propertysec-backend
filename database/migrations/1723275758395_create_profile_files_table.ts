import { FILE_CATEGORY_ENUM, FILETYPE_ENUM } from '#interfaces/file'
import { BaseSchema } from '@adonisjs/lucid/schema'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSchema {
  protected tableName = 'profile_files'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().defaultTo(uuidv4())
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.string('file_url').notNullable()
      table.string('file_name').notNullable()
      table.enum('file_type', Object.values(FILETYPE_ENUM)).notNullable()
      table.enum('file_category', Object.values(FILE_CATEGORY_ENUM)).notNullable()
      table.text('meta').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
