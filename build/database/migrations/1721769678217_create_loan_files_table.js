import { BaseSchema } from '@adonisjs/lucid/schema';
import { v4 as uuidv4 } from 'uuid';
export default class extends BaseSchema {
    tableName = 'loan_files';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4());
            table.uuid('loan_applicant_id').references('id').inTable('loan_applicants');
            table.string('file_url').notNullable();
            table.enum('file_type', ['image', 'other']).notNullable().defaultTo('image');
            table.text('meta').nullable();
            table.timestamp('created_at');
            table.timestamp('updated_at');
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1721769678217_create_loan_files_table.js.map