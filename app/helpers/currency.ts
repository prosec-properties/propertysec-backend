/**
 * Convert amount from kobo to naira
 * PayStack and other Nigerian payment providers return amounts in kobo
 * @param amountInKobo - Amount in kobo (smallest currency unit)
 * @returns Amount in naira (base currency unit)
 */
export function koboToNaira(amountInKobo: number): number {
  return amountInKobo / 100
}

/**
 * Convert amount from naira to kobo
 * Used when sending amounts to PayStack or other Nigerian payment providers
 * @param amountInNaira - Amount in naira (base currency unit)
 * @returns Amount in kobo (smallest currency unit)
 */
export function nairaToKobo(amountInNaira: number): number {
  return Math.round(amountInNaira * 100)
}

/**
 * Format amount as currency string
 * @param amount - Amount to format
 * @param currency - Currency code (default: NGN)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  if (currency === 'NGN') {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  
  return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
