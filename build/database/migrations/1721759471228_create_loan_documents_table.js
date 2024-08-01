import { BaseSchema } from '@adonisjs/lucid/schema';
import { v4 as uuidv4 } from 'uuid';
export default class extends BaseSchema {
    tableName = 'loan_documents';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4());
            table.uuid('application_id').references('id').inTable('loan_applications');
            table.enum('document_type', [
                'nin',
                'bvn',
                'salary_slip',
                'employment_letter',
                'bank_statement',
                'utility_bill',
            ]);
            table.string('document_url');
            table.text('meta').nullable();
            table.timestamp('created_at', { useTz: true });
            table.timestamp('updated_at', { useTz: true });
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1721759471228_create_loan_documents_table.js.map