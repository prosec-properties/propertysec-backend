export enum PRODUCT_CONDITION_ENUMS {
  NEW = 'new',
  USED = 'used',
  REFURBISHED = 'refurbished',
  NOT_APPLICABLE = 'not_applicable',
}

export enum PRODUCT_STATUS_ENUMS {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PENDING = 'pending',
  CLOSED = 'closed',
  REJECTED = 'rejected',
}

export enum PRODUCT_AVAILABILITY_ENUMS {
  AVAILABLE = 'available',
  SOLD = 'sold',
}

export type IProductStatus = `${PRODUCT_STATUS_ENUMS}`
export type IProductCondition = `${PRODUCT_CONDITION_ENUMS}`
export type IProductAvailability = `${PRODUCT_AVAILABILITY_ENUMS}`
