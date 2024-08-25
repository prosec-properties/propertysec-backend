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
