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
import string from '@adonisjs/core/helpers/string';
import Category from './category.js';
export default class Subcategory extends BaseModel {
    static generateUUID(model) {
        model.id = uuidv4();
    }
    static generateSlug(model) {
        model.slug = string.slug(model.name);
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], Subcategory.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Subcategory.prototype, "categoryId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Subcategory.prototype, "categoryName", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Subcategory.prototype, "name", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Subcategory.prototype, "slug", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], Subcategory.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], Subcategory.prototype, "updatedAt", void 0);
__decorate([
    hasOne(() => Category),
    __metadata("design:type", Object)
], Subcategory.prototype, "category", void 0);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Subcategory]),
    __metadata("design:returntype", void 0)
], Subcategory, "generateUUID", null);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Subcategory]),
    __metadata("design:returntype", void 0)
], Subcategory, "generateSlug", null);
//# sourceMappingURL=subcategory.js.map