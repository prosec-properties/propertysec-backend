import Category from '#models/category'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { v5 as uuidv5 } from 'uuid'
import { UUID_NAMESPACES } from '../../app/constants/namespaces.js'

// Generate category IDs using uuidv5 for consistency
export const CATEGORY_IDS = {
  RENT: uuidv5('category-rent-property', UUID_NAMESPACES.CATEGORY),
  SALE: uuidv5('category-sale-property', UUID_NAMESPACES.CATEGORY),
  SHORTLET: uuidv5('category-shortlet-property', UUID_NAMESPACES.CATEGORY),
  FASHION: uuidv5('category-fashion-product', UUID_NAMESPACES.CATEGORY),
  HOME_OFFICE: uuidv5('category-home-office-product', UUID_NAMESPACES.CATEGORY),
  FURNITURE: uuidv5('category-furniture-product', UUID_NAMESPACES.CATEGORY),
  VEHICLES: uuidv5('category-vehicles-product', UUID_NAMESPACES.CATEGORY),
  ELECTRONICS: uuidv5('category-electronics-product', UUID_NAMESPACES.CATEGORY),
  CONSTRUCTION: uuidv5('category-construction-product', UUID_NAMESPACES.CATEGORY),
  MACHINERY: uuidv5('category-machinery-product', UUID_NAMESPACES.CATEGORY),
  HEALTH_BEAUTY: uuidv5('category-health-beauty-product', UUID_NAMESPACES.CATEGORY),
  SERVICES: uuidv5('category-services-product', UUID_NAMESPACES.CATEGORY),
  AGRICULTURE: uuidv5('category-agriculture-product', UUID_NAMESPACES.CATEGORY),
  MEDICAL: uuidv5('category-medical-product', UUID_NAMESPACES.CATEGORY),
  PHONES_COMPUTERS: uuidv5('category-phones-computers-product', UUID_NAMESPACES.CATEGORY),
  BOOKS: uuidv5('category-books-product', UUID_NAMESPACES.CATEGORY),
  CHILDREN: uuidv5('category-children-product', UUID_NAMESPACES.CATEGORY),
  SPORTS_ART: uuidv5('category-sports-art-product', UUID_NAMESPACES.CATEGORY),
  OTHER: uuidv5('category-other-product', UUID_NAMESPACES.CATEGORY),
}

export default class extends BaseSeeder {
  async run() {
    const categories: (Pick<Category, 'name' | 'type'> & { id: string })[] = [
      // Property categories
      {
        id: CATEGORY_IDS.RENT,
        name: 'Rent',
        type: 'property',
      },
      {
        id: CATEGORY_IDS.SALE,
        name: 'Sale',
        type: 'property',
      },
      {
        id: CATEGORY_IDS.SHORTLET,
        name: 'Shortlet',
        type: 'property',
      },

      // Product categories
      {
        id: CATEGORY_IDS.FASHION,
        name: 'Fashion',
        type: 'product',
      },
      {
        id: CATEGORY_IDS.HOME_OFFICE,
        name: 'Home/Office Accessories',
        type: 'product',
      },
      {
        id: CATEGORY_IDS.FURNITURE,
        name: 'Furniture',
        type: 'product',
      },
      {
        id: CATEGORY_IDS.VEHICLES,
        name: 'Vehicles',
        type: 'product',
      },
      {
        id: CATEGORY_IDS.ELECTRONICS,
        name: 'Electronics',
        type: 'product',
      },
      {
        id: CATEGORY_IDS.CONSTRUCTION,
        name: 'Construction Materials',
        type: 'product',
      },
      {
        id: CATEGORY_IDS.MACHINERY,
        name: 'Machinery',
        type: 'product',
      },
      {
        id: CATEGORY_IDS.HEALTH_BEAUTY,
        name: 'Health & Beauty',
        type: 'product',
      },
      {
        id: CATEGORY_IDS.SERVICES,
        name: 'Services',
        type: 'product',
      },
      {
        id: CATEGORY_IDS.AGRICULTURE,
        name: 'Agriculture/Food',
        type: 'product',
      },
      {
        id: CATEGORY_IDS.MEDICAL,
        name: 'Medical Equipment',
        type: 'product',
      },
      {
        id: CATEGORY_IDS.PHONES_COMPUTERS,
        name: 'Phones & Computers',
        type: 'product',
      },
      {
        id: CATEGORY_IDS.BOOKS,
        name: 'Books',
        type: 'product',
      },
      {
        id: CATEGORY_IDS.CHILDREN,
        name: 'Children Items',
        type: 'product',
      },
      {
        id: CATEGORY_IDS.SPORTS_ART,
        name: 'Sports & Art',
        type: 'product',
      },
      {
        id: CATEGORY_IDS.OTHER,
        name: 'Other Products',
        type: 'product',
      },
    ]

    for (const category of categories) {
      await Category.updateOrCreate(
        { id: category.id },
        {
          id: category.id,
          status: 'active',
          name: category.name,
          type: category.type,
        }
      )
    }
  }
}
