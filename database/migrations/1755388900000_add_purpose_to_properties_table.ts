import { PROPERTY_PURPOSE_ENUMS } from '#interfaces/property'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'properties'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('purpose', PROPERTY_PURPOSE_ENUMS)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('purpose')
    })
  }
}