import { BaseSchema } from '@adonisjs/lucid/schema';
import { v4 as uuidv4 } from 'uuid';
export default class extends BaseSchema {
    tableName = 'subcategories';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4());
            table.string('category_id').notNullable();
            table.string('category_name').notNullable();
            table.string('name').notNullable();
            table.string('slug').unique().nullable();
            table.timestamp('created_at', { useTz: true });
            table.timestamp('updated_at', { useTz: true });
            table.index(['name'], 'subcategory_name_index');
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1721765206775_create_subcategories_table.js.map