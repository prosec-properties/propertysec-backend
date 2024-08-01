import { BaseSchema } from '@adonisjs/lucid/schema';
import { v4 as uuidv4 } from 'uuid';
export default class extends BaseSchema {
    tableName = 'loans';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4());
            table.enum('loan_type', ['personal', 'mortgage', 'auto', 'rent', 'business']);
            table.float('loan_amount');
            table.float('interest_rate');
            table.enum('loan_duration', ['1 month', '3 months', '6 months', '12 months']);
            table.enum('loan_status', ['pending', 'approved', 'rejected', 'disbursed']);
            table.text('meta').nullable();
            table.timestamp('created_at', { useTz: true });
            table.timestamp('updated_at', { useTz: true });
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1721758251373_create_loans_table.js.map