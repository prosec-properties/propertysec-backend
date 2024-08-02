import { BaseSchema } from '@adonisjs/lucid/schema';
import { v4 as uuidv4 } from 'uuid';
export default class extends BaseSchema {
    tableName = 'notifications';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4());
            table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
            table.json('data').nullable();
            table.text('message').notNullable();
            table.boolean('is_read').defaultTo(false).notNullable();
            table.string('read_at').nullable();
            table.timestamp('created_at', { useTz: true });
            table.timestamp('updated_at', { useTz: true });
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1721765211623_create_notifications_table.js.map