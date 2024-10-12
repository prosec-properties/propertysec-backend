// import Plan from 'App/Models/Plan'
import { DateTime } from 'luxon'
import { customRandom, random } from 'nanoid'
import Plan from '#models/plan'
import { NUMERIC_STRING } from '#constants/general'

export const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case 'NGN':
      return '₦'
    case 'USD':
      return '$'
    case 'GBP':
      return '£'
    case 'EUR':
      return '€'
    case 'ZAR':
      return 'R'
    case 'KES':
      return 'KSh'
    case 'GHS':
      return '₵'
    case 'XOF':
      return 'CFA'
    default:
      return ''
  }
}



export const getPaystackAmount = (amount: number) => {
  if (amount < 2500) {
    return amount * 100
  }
  let fee = getPaystackAmountFee(amount)
  return (amount + fee) * 100
}
``
export const getPaystackAmountFee = (amount: number) => {
  if (amount < 2500) {
    return 0
  }

  let fee = 100 + (amount / 100) * 1.52225794999

  if (fee >= 2000) {
    fee = 2000
  }

  return Math.floor(fee)
}

export const calculateSubscriptionAmountLeft = ({
  subscriptionPaidAt,
  oldPlan,
}: {
  oldPlan: Plan
  subscriptionPaidAt: string
}) => {
  const price = getDiscountAmount(oldPlan.price, oldPlan.discountPercentage)
  const amountPerDay = price / (oldPlan.duration * 31)

  const daysLeft = DateTime.fromISO(subscriptionPaidAt).diffNow('days').days

  const amountSpent = amountPerDay * daysLeft

  return Math.floor(price - amountSpent)
}

export const randomNumericString = (size = 6) => {
  return customRandom(NUMERIC_STRING, size, random)()
}

export const getDiscountAmount = (amount: number, discount?: number) => {
  if (!discount) return amount
  const discountAmount = (amount / 100) * discount
  return amount - discountAmount
}

export const formatPrice = (price: number) => {
  const formatter = new Intl.NumberFormat('en-NG')
  return `₦${formatter.format(price)}`
}

export const calculateVat = (amount: number) => {
  return amount * 0.075
}

