// import SubCategory from '#models/subcategory'
// import { BaseSeeder } from '@adonisjs/lucid/seeders'
// import { CATEGORY_IDS } from './AAAcategory_seeder.js'

// export default class extends BaseSeeder {
//   async run() {
//     const subcategories = [
//       // Rent subcategories
//       {
//         id: '660e8400-e29b-41d4-a716-446655440000',
//         name: 'Apartments',
//         categoryId: CATEGORY_IDS.RENT,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440001',
//         name: 'Houses',
//         categoryId: CATEGORY_IDS.RENT,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440002',
//         name: 'Commercial Spaces',
//         categoryId: CATEGORY_IDS.RENT,
//       },

//       // Sale subcategories
//       {
//         id: '660e8400-e29b-41d4-a716-446655440003',
//         name: 'Apartments',
//         categoryId: CATEGORY_IDS.SALE,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440004',
//         name: 'Houses',
//         categoryId: CATEGORY_IDS.SALE,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440005',
//         name: 'Land',
//         categoryId: CATEGORY_IDS.SALE,
//       },

//       // Shortlet subcategories
//       {
//         id: '660e8400-e29b-41d4-a716-446655440006',
//         name: 'Vacation Homes',
//         categoryId: CATEGORY_IDS.SHORTLET,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440007',
//         name: 'Service Apartments',
//         categoryId: CATEGORY_IDS.SHORTLET,
//       },

//       // Fashion subcategories
//       {
//         id: '660e8400-e29b-41d4-a716-446655440008',
//         name: "Men's Clothing",
//         categoryId: CATEGORY_IDS.FASHION,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440009',
//         name: "Women's Clothing",
//         categoryId: CATEGORY_IDS.FASHION,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440010',
//         name: 'Shoes',
//         categoryId: CATEGORY_IDS.FASHION,
//       },

//       // Home/Office subcategories
//       {
//         id: '660e8400-e29b-41d4-a716-446655440011',
//         name: 'Kitchen Appliances',
//         categoryId: CATEGORY_IDS.HOME_OFFICE,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440012',
//         name: 'Office Equipment',
//         categoryId: CATEGORY_IDS.HOME_OFFICE,
//       },

//       // Furniture subcategories
//       {
//         id: '660e8400-e29b-41d4-a716-446655440013',
//         name: 'Living Room',
//         categoryId: CATEGORY_IDS.FURNITURE,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440014',
//         name: 'Bedroom',
//         categoryId: CATEGORY_IDS.FURNITURE,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440015',
//         name: 'Office Furniture',
//         categoryId: CATEGORY_IDS.FURNITURE,
//       },

//       // Vehicles subcategories
//       {
//         id: '660e8400-e29b-41d4-a716-446655440016',
//         name: 'Cars',
//         categoryId: CATEGORY_IDS.VEHICLES,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440017',
//         name: 'Motorcycles',
//         categoryId: CATEGORY_IDS.VEHICLES,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440018',
//         name: 'Auto Parts',
//         categoryId: CATEGORY_IDS.VEHICLES,
//       },

//       // Electronics subcategories
//       {
//         id: '660e8400-e29b-41d4-a716-446655440019',
//         name: 'TVs',
//         categoryId: CATEGORY_IDS.ELECTRONICS,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440020',
//         name: 'Audio Systems',
//         categoryId: CATEGORY_IDS.ELECTRONICS,
//       },

//       // Construction subcategories
//       {
//         id: '660e8400-e29b-41d4-a716-446655440021',
//         name: 'Building Materials',
//         categoryId: CATEGORY_IDS.CONSTRUCTION,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440022',
//         name: 'Tools',
//         categoryId: CATEGORY_IDS.CONSTRUCTION,
//       },

//       // Machinery subcategories
//       {
//         id: '660e8400-e29b-41d4-a716-446655440023',
//         name: 'Industrial',
//         categoryId: CATEGORY_IDS.MACHINERY,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440024',
//         name: 'Agricultural',
//         categoryId: CATEGORY_IDS.MACHINERY,
//       },

//       // Health & Beauty subcategories
//       {
//         id: '660e8400-e29b-41d4-a716-446655440025',
//         name: 'Skincare',
//         categoryId: CATEGORY_IDS.HEALTH_BEAUTY,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440026',
//         name: 'Makeup',
//         categoryId: CATEGORY_IDS.HEALTH_BEAUTY,
//       },

//       // Services subcategories
//       {
//         id: '660e8400-e29b-41d4-a716-446655440027',
//         name: 'Cleaning',
//         categoryId: CATEGORY_IDS.SERVICES,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440028',
//         name: 'Repairs',
//         categoryId: CATEGORY_IDS.SERVICES,
//       },

//       // Agriculture/Food subcategories
//       {
//         id: '660e8400-e29b-41d4-a716-446655440029',
//         name: 'Fresh Produce',
//         categoryId: CATEGORY_IDS.AGRICULTURE,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440030',
//         name: 'Livestock',
//         categoryId: CATEGORY_IDS.AGRICULTURE,
//       },

//       // Medical Equipment subcategories
//       {
//         id: '660e8400-e29b-41d4-a716-446655440031',
//         name: 'Diagnostic Equipment',
//         categoryId: CATEGORY_IDS.MEDICAL,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440032',
//         name: 'Patient Care',
//         categoryId: CATEGORY_IDS.MEDICAL,
//       },

//       // Phones & Computers subcategories
//       {
//         id: '660e8400-e29b-41d4-a716-446655440033',
//         name: 'Smartphones',
//         categoryId: CATEGORY_IDS.PHONES_COMPUTERS,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440034',
//         name: 'Laptops',
//         categoryId: CATEGORY_IDS.PHONES_COMPUTERS,
//       },

//       // Books subcategories
//       {
//         id: '660e8400-e29b-41d4-a716-446655440035',
//         name: 'Academic',
//         categoryId: CATEGORY_IDS.BOOKS,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440036',
//         name: 'Fiction',
//         categoryId: CATEGORY_IDS.BOOKS,
//       },

//       // Children Items subcategories
//       {
//         id: '660e8400-e29b-41d4-a716-446655440037',
//         name: 'Toys',
//         categoryId: CATEGORY_IDS.CHILDREN,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440038',
//         name: 'Clothing',
//         categoryId: CATEGORY_IDS.CHILDREN,
//       },

//       // Sports & Art subcategories
//       {
//         id: '660e8400-e29b-41d4-a716-446655440039',
//         name: 'Sports Equipment',
//         categoryId: CATEGORY_IDS.SPORTS_ART,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440040',
//         name: 'Art Supplies',
//         categoryId: CATEGORY_IDS.SPORTS_ART,
//       },

//       // Other Products subcategories
//       {
//         id: '660e8400-e29b-41d4-a716-446655440041',
//         name: 'Miscellaneous',
//         categoryId: CATEGORY_IDS.OTHER,
//       },
//       {
//         id: '660e8400-e29b-41d4-a716-446655440042',
//         name: 'Other Items',
//         categoryId: CATEGORY_IDS.OTHER,
//       },
//     ]

//     for (const subcategory of subcategories) {
//       await SubCategory.updateOrCreate(
//         { id: subcategory.id },
//         {
//           id: subcategory.id,
//           name: subcategory.name,
//           status: 'active',
//           categoryId: subcategory.categoryId,
//         }
//       )
//     }
//   }
// }
