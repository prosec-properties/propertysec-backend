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
export default class UserSetting extends BaseModel {
    static generateId(property) {
        property.id = uuidv4();
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], UserSetting.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], UserSetting.prototype, "userId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], UserSetting.prototype, "columnName", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], UserSetting.prototype, "columnValue", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], UserSetting.prototype, "meta", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], UserSetting.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], UserSetting.prototype, "updatedAt", void 0);
__decorate([
    hasOne(() => User),
    __metadata("design:type", Object)
], UserSetting.prototype, "user", void 0);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserSetting]),
    __metadata("design:returntype", void 0)
], UserSetting, "generateId", null);
//# sourceMappingURL=user_setting.js.map