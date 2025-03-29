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

export type IProductStatus =  'draft' | 'published' | 'pending' | 'closed' | 'rejected'

export type IProductCondition = 'new' | 'used' | 'refurbished' | 'not_applicable'
