export const PROPERTY_TYPE_ENUMS = [
  'All',
  'House',
  'Apartment',
  'Office',
  'Land',
  'Warehouse',
  'Shop',
  'Hotel',
  'Event Center',
  'School',
  'Church',
  'Mosque',
  'Factory',
  'Farm',
  'Hostel',
  'Restaurant',
  'Bar',
  'Club',
  'Gym',
  'Salon',
  'Spa',
  'Cinema',
  'Theater',
  'Hospital',
  'Clinic',
  'Pharmacy',
  'Supermarket',
  'Mall',
  'Market',
  'Petrol Station',
] as const

export type IPropertyType = (typeof PROPERTY_TYPE_ENUMS)[number]

export type IPropertyStatus = 'draft' | 'published' | 'pending' | 'closed' | 'rejected'

export const PROPERTY_STATUS_ENUMS = ['draft', 'published', 'pending', 'closed', 'rejected']
