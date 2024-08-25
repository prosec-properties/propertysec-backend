export const IPropertyTypes = [
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

export type IPropertyType = (typeof IPropertyTypes)[number]



