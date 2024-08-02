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
import { v4 as uuidv4 } from 'uuid';
import string from '@adonisjs/core/helpers/string';
import Subcategory from './subcategory.js';
export default class Category extends BaseModel {
    static generateId(property) {
        property.id = uuidv4();
    }
    static generateSlug(property) {
        property.slug = string.slug(property.name);
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], Category.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Category.prototype, "name", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Category.prototype, "description", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Category.prototype, "status", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Category.prototype, "slug", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Category.prototype, "meta", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], Category.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], Category.prototype, "updatedAt", void 0);
__decorate([
    hasMany(() => Subcategory),
    __metadata("design:type", Object)
], Category.prototype, "subcategories", void 0);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Category]),
    __metadata("design:returntype", void 0)
], Category, "generateId", null);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Category]),
    __metadata("design:returntype", void 0)
], Category, "generateSlug", null);
//# sourceMappingURL=category.js.map