var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { DateTime } from 'luxon';
import { BaseModel, beforeCreate, column, hasOne } from '@adonisjs/lucid/orm';
import { v4 as uuidv4 } from 'uuid';
import User from './user.js';
export default class LoanApplicant extends BaseModel {
    static generateUUID(model) {
        model.id = uuidv4();
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], LoanApplicant.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "userId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "nationality", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "state", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "city", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "religion", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "currentAddress", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], LoanApplicant.prototype, "monthlySalary", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "bankName", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "bankAccountNumber", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "bankAccountName", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "nin", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "bvn", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "companyAddress", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "companyName", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "companyPosition", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "companyPhoneNumber", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "companyEmail", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], LoanApplicant.prototype, "yearsInApartment", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], LoanApplicant.prototype, "numberOfRooms", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "reasonForFunds", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "landlordName", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "landlordPhoneNumber", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "landlordEmail", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "landlordAddress", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "landlordBankName", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "landlordBankAccountNumber", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "landlordBankAccountName", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "guarantorName", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "guarantorPhoneNumber", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "guarantorEmail", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "guarantorHomeAddress", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "guarantorOfficeAddress", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanApplicant.prototype, "meta", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], LoanApplicant.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], LoanApplicant.prototype, "updatedAt", void 0);
__decorate([
    hasOne(() => User),
    __metadata("design:type", Object)
], LoanApplicant.prototype, "user", void 0);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoanApplicant]),
    __metadata("design:returntype", void 0)
], LoanApplicant, "generateUUID", null);
//# sourceMappingURL=loan_applicant.js.map