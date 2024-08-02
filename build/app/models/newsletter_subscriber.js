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
import User from './user.js';
import { v4 as uuidv4 } from 'uuid';
export default class Newsletter extends BaseModel {
    static generateUUID(model) {
        model.id = uuidv4();
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], Newsletter.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Newsletter.prototype, "email", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Newsletter.prototype, "status", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Newsletter.prototype, "ipInfo", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Newsletter.prototype, "unsubscribedAt", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Newsletter.prototype, "unsubscribeReason", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Newsletter.prototype, "userId", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], Newsletter.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], Newsletter.prototype, "updatedAt", void 0);
__decorate([
    hasOne(() => User),
    __metadata("design:type", Object)
], Newsletter.prototype, "user", void 0);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Newsletter]),
    __metadata("design:returntype", void 0)
], Newsletter, "generateUUID", null);
//# sourceMappingURL=newsletter_subscriber.js.map