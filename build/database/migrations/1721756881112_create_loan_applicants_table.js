import { BaseSchema } from '@adonisjs/lucid/schema';
import { v4 as uuidv4 } from 'uuid';
export default class extends BaseSchema {
    tableName = 'loan_applicants';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().notNullable().unique().defaultTo(uuidv4());
            table.uuid('user_id').references('id').inTable('users');
            table.string('nationality');
            table.string('state');
            table.string('city');
            table.string('religion');
            table.string('current_address');
            table.float('monthly_salary');
            table.string('nin');
            table.string('bvn');
            table.string('next_of_kin_name');
            table.string('bank_name');
            table.string('bank_account_number');
            table.string('bank_account_name');
            table.string('company_address');
            table.string('company_name');
            table.string('position_in_company');
            table.string('company_phone_number');
            table.string('company_email');
            table.integer('years_in_apartment');
            table.integer('number_of_rooms');
            table.string('reason_for_funds');
            table.string('landlord_name');
            table.string('landlord_phone_number');
            table.string('landlord_email');
            table.string('landlord_address');
            table.string('landlord_bank_name');
            table.string('landlord_bank_account_number');
            table.string('landlord_bank_account_name');
            table.string('guarantor_name');
            table.string('guarantor_phone_number');
            table.string('guarantor_email');
            table.string('guarantor_home_address');
            table.string('guarantor_office_address');
            table.text('meta').nullable();
            table.timestamp('created_at', { useTz: true });
            table.timestamp('updated_at', { useTz: true });
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1721756881112_create_loan_applicants_table.js.map