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
import Category from './category.js';
import { v4 as uuidv4 } from 'uuid';
import string from '@adonisjs/core/helpers/string';
import { nanoid } from 'nanoid';
export default class Property extends BaseModel {
    static generateId(property) {
        property.id = uuidv4();
    }
    static generateSlug(property) {
        property.slug = string.slug(property.name + nanoid(5));
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], Property.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Property.prototype, "userId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Property.prototype, "title", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Property.prototype, "categoryId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Property.prototype, "type", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Property.prototype, "bedrooms", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Property.prototype, "bathrooms", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Property.prototype, "toilets", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Property.prototype, "property_address", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Property.prototype, "street", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Property.prototype, "price", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Property.prototype, "currency", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Property.prototype, "append", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Property.prototype, "description", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Property.prototype, "status", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Property.prototype, "slug", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Property.prototype, "meta", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], Property.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], Property.prototype, "updatedAt", void 0);
__decorate([
    hasOne(() => User),
    __metadata("design:type", Object)
], Property.prototype, "user", void 0);
__decorate([
    hasOne(() => Category),
    __metadata("design:type", Object)
], Property.prototype, "category", void 0);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Category]),
    __metadata("design:returntype", void 0)
], Property, "generateId", null);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Category]),
    __metadata("design:returntype", void 0)
], Property, "generateSlug", null);
//# sourceMappingURL=property.js.map