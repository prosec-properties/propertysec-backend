import { AcceptedCurrencies, PlanName } from '#interfaces/payment'
import Plan from '#models/plan'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { v5 as uuidv5 } from 'uuid'
import { UUID_NAMESPACES } from '../../app/constants/namespaces.js'

const mockFeatures = {
  FREE: ['2-3 property uploads.', 'Basic listing visibility.', 'Standard support.', '', ''],
  SILVER: [
    '10 property uploads max.',
    'Enhanced listing visibility.',
    'Priority support.',
    'Property promotion tools.',
    'Analytics dashboard.',
  ],
  GOLD: [
    '30 property uploads max.',
    'Premium listing visibility.',
    'Priority support.',
    'Advanced promotion tools.',
    'Detailed analytics.',
  ],
  PLATINUM: [
    '60 property uploads max.',
    'Top-tier listing visibility.',
    'VIP support.',
    'Premium promotion tools.',
    'Advanced analytics & insights.',
  ],
  UNLIMITED: [
    'Unlimited property uploads.',
    'Maximum listing visibility.',
    'VIP support.',
    'All promotion tools.',
    'Complete analytics suite.',
  ],
}
export default class extends BaseSeeder {
  async run() {
    // const uniqueKey = 'duration'
    const plans = [
      // FREE Plan - 1 month only (no discount needed for free plan)
      {
        name: 'FREE',
        features: JSON.stringify(mockFeatures.FREE),
        price: 0,
        currency: 'NGN',
        duration: 1, // in months
        order: 0,
      },

      // SILVER Plans
      {
        name: 'SILVER',
        features: JSON.stringify(mockFeatures.SILVER),
        price: 10000,
        currency: 'NGN',
        duration: 1,
        order: 1,
      },
      {
        name: 'SILVER',
        features: JSON.stringify(mockFeatures.SILVER),
        price: 28000, // ~7% discount (30,000 - 2,000)
        currency: 'NGN',
        duration: 3,
        order: 1,
      },
      {
        name: 'SILVER',
        features: JSON.stringify(mockFeatures.SILVER),
        price: 54000, // 10% discount (60,000 - 6,000)
        currency: 'NGN',
        duration: 6,
        order: 1,
      },

      // GOLD Plans
      {
        name: 'GOLD',
        features: JSON.stringify(mockFeatures.GOLD),
        price: 20000,
        currency: 'NGN',
        duration: 1,
        order: 2,
      },
      {
        name: 'GOLD',
        features: JSON.stringify(mockFeatures.GOLD),
        price: 56000, // ~7% discount (60,000 - 4,000)
        currency: 'NGN',
        duration: 3,
        order: 2,
      },
      {
        name: 'GOLD',
        features: JSON.stringify(mockFeatures.GOLD),
        price: 108000, // 10% discount (120,000 - 12,000)
        currency: 'NGN',
        duration: 6,
        order: 2,
      },

      // PLATINUM Plans
      {
        name: 'PLATINUM',
        features: JSON.stringify(mockFeatures.PLATINUM),
        price: 45000,
        currency: 'NGN',
        duration: 1,
        order: 3,
      },
      {
        name: 'PLATINUM',
        features: JSON.stringify(mockFeatures.PLATINUM),
        price: 126000, // ~7% discount (135,000 - 9,000)
        currency: 'NGN',
        duration: 3,
        order: 3,
      },
      {
        name: 'PLATINUM',
        features: JSON.stringify(mockFeatures.PLATINUM),
        price: 243000, // 10% discount (270,000 - 27,000)
        currency: 'NGN',
        duration: 6,
        order: 3,
      },

      // UNLIMITED Plans
      {
        name: 'UNLIMITED',
        features: JSON.stringify(mockFeatures.UNLIMITED),
        price: 69000,
        currency: 'NGN',
        duration: 1,
        order: 4,
      },
      {
        name: 'UNLIMITED',
        features: JSON.stringify(mockFeatures.UNLIMITED),
        price: 193000, // ~7% discount (207,000 - 14,000)
        currency: 'NGN',
        duration: 3,
        order: 4,
      },
      {
        name: 'UNLIMITED',
        features: JSON.stringify(mockFeatures.UNLIMITED),
        price: 372000, // 10% discount (414,000 - 42,000)
        currency: 'NGN',
        duration: 6,
        order: 4,
      },
    ]

    for (const plan of plans) {
      // Create a consistent seed for UUID generation
      const planSeed = `${plan.name}-${plan.duration}-${plan.price}`

      await Plan.updateOrCreate(
        {
          name: plan.name as PlanName,
          duration: plan.duration,
        },
        {
          id: uuidv5(planSeed, UUID_NAMESPACES.PLAN),
          name: plan.name as PlanName,
          price: plan.price,
          features: plan.features,
          currency: plan.currency as AcceptedCurrencies,
          duration: plan.duration,
          order: plan.order,
        }
      )
    }

    // await Plan.updateOrCreateMany(uniqueKey, [])

    // const allPlans = await Plan.query().whereNull('paystackPlanId')

    // for (const plan of plans) {
    // const paystackPlan = await paystack.createPlan({
    //   name: plan.name,
    //   amount: plan.price,
    //   interval:
    //     plan.duration === 1 ? 'monthly' : plan.duration === 3 ? 'quarterly' : 'biannually',
    // })

    // plan.paystackPlanId = paystackPlan?.plan_code
    //   await plan.save()
    // }
  }
}
