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
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm';
import { v4 as uuidv4 } from 'uuid';
import string from '@adonisjs/core/helpers/string';
import { nanoid } from 'nanoid';
import User from './user.js';
export default class Product extends BaseModel {
    static generateUUID(model) {
        model.id = uuidv4();
    }
    static generateSlug(model) {
        model.slug = string.slug(model.name + nanoid(5));
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], Product.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Product.prototype, "userId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Product.prototype, "categoryId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Product.prototype, "subCategoryId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Product.prototype, "location", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Product.prototype, "price", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Product.prototype, "meta", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Product.prototype, "status", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Product.prototype, "slug", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], Product.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], Product.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => User),
    __metadata("design:type", Object)
], Product.prototype, "user", void 0);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Product]),
    __metadata("design:returntype", void 0)
], Product, "generateUUID", null);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Product]),
    __metadata("design:returntype", void 0)
], Product, "generateSlug", null);
//# sourceMappingURL=product.js.map