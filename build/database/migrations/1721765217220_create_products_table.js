import { BaseSchema } from '@adonisjs/lucid/schema';
import { v4 as uuidv4 } from 'uuid';
export default class extends BaseSchema {
    tableName = 'products';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4());
            table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
            table.uuid('category_id').references('id').inTable('categories');
            table.uuid('subcategory_id').references('id').inTable('subcategories');
            table.string('name').notNullable();
            table.string('location').nullable();
            table.bigInteger('price').notNullable();
            table.text('description').nullable();
            table.text('meta').nullable();
            table
                .enum('status', ['active', 'inactive', 'cancelled', 'draft', 'unsubscribed', 'other'])
                .defaultTo('ACTIVE');
            table.string('slug').notNullable().unique();
            table.timestamp('created_at', { useTz: true });
            table.timestamp('updated_at', { useTz: true });
            table.index(['category_id'], 'category_id_index');
            table.index(['user_id'], 'user_id_index');
            table.index(['location'], 'price_index');
            table.index(['name', 'location'], 'name_location_index');
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1721765217220_create_products_table.js.map