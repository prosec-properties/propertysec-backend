import { DateTime } from 'luxon'

export interface ILoanCalculation {
  loanAmount: number
  interestRate: number
  durationInMonths: number
  totalAmount: number
  monthlyPayment: number
  totalInterest: number
}

export interface ILoanRepaymentSchedule {
  month: number
  paymentAmount: number
  principalAmount: number
  interestAmount: number
  remainingBalance: number
  dueDate: DateTime
}

export function calculateLoanDetails(
  loanAmount: number,
  interestRate: number,
  durationInMonths: number
): ILoanCalculation {
  const monthlyInterestRate = interestRate / 100 / 12
  
  // Calculate monthly payment using formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const monthlyPayment = monthlyInterestRate > 0 
    ? loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, durationInMonths)) / 
      (Math.pow(1 + monthlyInterestRate, durationInMonths) - 1)
    : loanAmount / durationInMonths

  const totalAmount = monthlyPayment * durationInMonths
  const totalInterest = totalAmount - loanAmount

  return {
    loanAmount,
    interestRate,
    durationInMonths,
    totalAmount: Math.round(totalAmount * 100) / 100,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
  }
}


export function generateRepaymentSchedule(
  loanAmount: number,
  interestRate: number,
  durationInMonths: number,
  startDate: DateTime = DateTime.now()
): ILoanRepaymentSchedule[] {
  const monthlyInterestRate = interestRate / 100 / 12
  const loanDetails = calculateLoanDetails(loanAmount, interestRate, durationInMonths)
  
  let remainingBalance = loanAmount
  const schedule: ILoanRepaymentSchedule[] = []

  for (let month = 1; month <= durationInMonths; month++) {
    const interestAmount = remainingBalance * monthlyInterestRate
    const principalAmount = loanDetails.monthlyPayment - interestAmount
    remainingBalance = Math.max(0, remainingBalance - principalAmount)

    schedule.push({
      month,
      paymentAmount: Math.round(loanDetails.monthlyPayment * 100) / 100,
      principalAmount: Math.round(principalAmount * 100) / 100,
      interestAmount: Math.round(interestAmount * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
      dueDate: startDate.plus({ months: month })
    })
  }

  return schedule
}

/**
 * Calculate outstanding balance including penalties for overdue loans
 */
export function calculateOutstandingBalance(
  originalAmount: number,
  paidAmount: number,
  interestRate: number,
  durationInMonths: number,
  startDate: DateTime,
  penaltyRate: number = 2 // 2% per month penalty
): {
  outstandingPrincipal: number
  outstandingInterest: number
  penaltyAmount: number
  totalOutstanding: number
} {
  const loanDetails = calculateLoanDetails(originalAmount, interestRate, durationInMonths)
  const totalAmountDue = loanDetails.totalAmount
  const outstandingAmount = totalAmountDue - paidAmount

  // Calculate penalty for overdue payments
  const currentDate = DateTime.now()
  const loanEndDate = startDate.plus({ months: durationInMonths })
  const overdueDays = Math.max(0, currentDate.diff(loanEndDate, 'days').days)
  const overdueMonths = Math.floor(overdueDays / 30)
  
  const penaltyAmount = overdueMonths > 0 ? (outstandingAmount * penaltyRate / 100) * overdueMonths : 0

  // Estimate principal vs interest breakdown
  const principalPortion = originalAmount / totalAmountDue
  const outstandingPrincipal = outstandingAmount * principalPortion
  const outstandingInterest = outstandingAmount * (1 - principalPortion)

  return {
    outstandingPrincipal: Math.round(outstandingPrincipal * 100) / 100,
    outstandingInterest: Math.round(outstandingInterest * 100) / 100,
    penaltyAmount: Math.round(penaltyAmount * 100) / 100,
    totalOutstanding: Math.round((outstandingAmount + penaltyAmount) * 100) / 100
  }
}


export function parseLoanDuration(duration: string): number {
  const durationMap: Record<string, number> = {
    '1 month': 1,
    '3 months': 3,
    '6 months': 6,
    '12 months': 12,
  }
  
  return durationMap[duration] || 1
}
