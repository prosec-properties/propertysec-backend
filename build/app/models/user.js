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
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm';
import hash from '@adonisjs/core/services/hash';
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens';
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid';
import { compose } from '@adonisjs/core/helpers';
import Property from './property.js';
import { v4 as uuidv4 } from 'uuid';
const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
    uids: ['email'],
    passwordColumnName: 'password',
});
export default class User extends compose(BaseModel, AuthFinder) {
    currentAccessToken;
    static accessTokens = DbAccessTokensProvider.forModel(User);
    static generateId(property) {
        property.id = uuidv4();
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], User.prototype, "fullName", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    column({ serializeAs: null }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    column(),
    __metadata("design:type", Boolean)
], User.prototype, "emailVerified", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], User.prototype, "avatarUrl", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], User.prototype, "state", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], User.prototype, "city", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], User.prototype, "address", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], User.prototype, "authProvider", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], User.prototype, "meta", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], User.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], User.prototype, "updatedAt", void 0);
__decorate([
    hasMany(() => Property),
    __metadata("design:type", Object)
], User.prototype, "properties", void 0);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User]),
    __metadata("design:returntype", void 0)
], User, "generateId", null);
//# sourceMappingURL=user.js.map