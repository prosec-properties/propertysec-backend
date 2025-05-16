import { AcceptedCurrencies, PlanName } from '#interfaces/payment'
import Plan from '#models/plan'
import paystack from '#services/paystack'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { v4 as uuidv4 } from 'uuid'


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
    const plans = [
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
    ]

    for (const plan of plans) {
      await Plan.updateOrCreate(
        {
          name: plan.name as PlanName,
        },
        {
          id: uuidv4(),
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
