import Plan from '#models/plan'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

const mockFeatures = {
  VIP: ['10 uploads.', '24 hours renewal.', 'Public visit.', '', ''],
  LUX: [
    '100 uploads.',
    '12 hours renewal.',
    'Public visit.',
    'Top 10 page ranking.',
    'Quick visit.',
  ],
  PRO: [
    'Unlimited uploads.',
    '3 hours renewal.',
    'Public visit.',
    'Top 5 page ranking.',
    'Quick visit.',
  ],
}
export default class extends BaseSeeder {
  async run() {
    const uniqueKey = 'duration'

    await Plan.updateOrCreateMany(uniqueKey, [
      {
        name: 'VIP',
        features: JSON.stringify(mockFeatures.VIP),
        price: 10000,
        currency: 'NGN',
        duration: 1, // in months
        order: 0,
      },

      {
        name: 'VIP',
        features: JSON.stringify(mockFeatures.VIP),
        price: 15000,
        currency: 'NGN',
        duration: 3,
        order: 1,
      },

      {
        name: 'VIP',
        features: JSON.stringify(mockFeatures.VIP),
        price: 40000,
        currency: 'NGN',
        duration: 6,
        order: 2,
      },

      {
        name: 'LUX',
        features: JSON.stringify(mockFeatures.LUX),
        price: 25000,
        currency: 'NGN',
        duration: 1,
        order: 0,
      },
      {
        name: 'LUX',
        features: JSON.stringify(mockFeatures.LUX),
        price: 70000,
        currency: 'NGN',
        duration: 3,
        order: 1,
      },
      {
        name: 'LUX',
        features: JSON.stringify(mockFeatures.LUX),
        price: 140000,
        currency: 'NGN',
        duration: 6,
        order: 2,
      },
      {
        name: 'PRO',
        features: JSON.stringify(mockFeatures.PRO),
        price: 70000,
        currency: 'NGN',
        duration: 1,
        order: 0,
      },
      {
        name: 'PRO',
        features: JSON.stringify(mockFeatures.PRO),
        price: 120000,
        currency: 'NGN',
        duration: 3,
        order: 1,
      },
      {
        name: 'PRO',
        features: JSON.stringify(mockFeatures.PRO),
        price: 390000,
        currency: 'NGN',
        duration: 6,
        order: 2,
      },
    ])
  }
}
