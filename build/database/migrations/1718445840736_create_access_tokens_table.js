import { BaseSchema } from '@adonisjs/lucid/schema';
import { v4 as uuidv4 } from 'uuid';
export default class extends BaseSchema {
    tableName = 'auth_access_tokens';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4());
            table.uuid('tokenable_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.string('type').notNullable();
            table.string('name').nullable();
            table.string('hash').notNullable();
            table.text('abilities').notNullable();
            table.timestamp('created_at', { useTz: true });
            table.timestamp('updated_at', { useTz: true });
            table.timestamp('last_used_at').nullable();
            table.timestamp('expires_at').nullable();
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1718445840736_create_access_tokens_table.js.map