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
import LoanApplication from './loan_application.js';
export default class LoanDocument extends BaseModel {
    static generateUUID(model) {
        model.id = uuidv4();
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], LoanDocument.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanDocument.prototype, "applicationId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanDocument.prototype, "documentType", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanDocument.prototype, "documentUrl", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanDocument.prototype, "meta", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], LoanDocument.prototype, "documentName", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], LoanDocument.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], LoanDocument.prototype, "updatedAt", void 0);
__decorate([
    hasOne(() => LoanApplication),
    __metadata("design:type", Object)
], LoanDocument.prototype, "loanApplication", void 0);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoanDocument]),
    __metadata("design:returntype", void 0)
], LoanDocument, "generateUUID", null);
//# sourceMappingURL=loan_document.js.map