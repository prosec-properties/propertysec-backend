import Category from '#models/category'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

// Define category IDs as constants to reference in subcategory seeder
export const CATEGORY_IDS = {
  RENT: '550e8400-e29b-41d4-a716-446655440000',
  SALE: '550e8400-e29b-41d4-a716-446655440001',
  SHORTLET: '550e8400-e29b-41d4-a716-446655440002',
  FASHION: '550e8400-e29b-41d4-a716-446655440003',
  HOME_OFFICE: '550e8400-e29b-41d4-a716-446655440004',
  FURNITURE: '550e8400-e29b-41d4-a716-446655440005',
  VEHICLES: '550e8400-e29b-41d4-a716-446655440006',
  ELECTRONICS: '550e8400-e29b-41d4-a716-446655440007',
  CONSTRUCTION: '550e8400-e29b-41d4-a716-446655440008',
  MACHINERY: '550e8400-e29b-41d4-a716-446655440009',
  HEALTH_BEAUTY: '550e8400-e29b-41d4-a716-446655440010',
  SERVICES: '550e8400-e29b-41d4-a716-446655440011',
  AGRICULTURE: '550e8400-e29b-41d4-a716-446655440012',
  MEDICAL: '550e8400-e29b-41d4-a716-446655440013',
  PHONES_COMPUTERS: '550e8400-e29b-41d4-a716-446655440014',
  BOOKS: '550e8400-e29b-41d4-a716-446655440015',
  CHILDREN: '550e8400-e29b-41d4-a716-446655440016',
  SPORTS_ART: '550e8400-e29b-41d4-a716-446655440017',
  OTHER: '550e8400-e29b-41d4-a716-446655440018',
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
          name: category.name,
          type: category.type,
        }
      )
    }
  }
}
