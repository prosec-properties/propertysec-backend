import { BaseSchema } from '@adonisjs/lucid/schema';
import { v4 as uuidv4 } from 'uuid';
export default class extends BaseSchema {
    tableName = 'newsletter_subscribers';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4());
            table.string('email').notNullable().unique();
            table
                .enu('status', ['subscribed', 'unsubscribed', 'pending'])
                .defaultTo('subscribed')
                .notNullable();
            table.text('ip_info').nullable();
            table.string('unsubscribed_at').nullable();
            table.string('unsubscribe_reason').nullable();
            table.uuid('user_id').nullable();
            table.timestamp('created_at', { useTz: true });
            table.timestamp('updated_at', { useTz: true });
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1721765229931_create_newsletter_subscribers_table.js.map