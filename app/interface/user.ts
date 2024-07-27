export const IUserRoleEnum = [
  'landlord',
  'buyer',
  'affiliate',
  'developer',
  'lawyer',
  'admin',
  'other',
] as const

export type IUserRole = 'landlord' | 'buyer' | 'affiliate' | 'developer' | 'lawyer' | 'admin' | 'other'
