export interface FileMetaData {
  clientName: string
  name: string
  size: number
  type: string
  lastModifiedDate: string
  lastModified: string
  [key: string]: any
}

export interface FileData {
  tmpPath: string
  size: number
  clientName: string
  type: string
  subtype: string
  fieldName: string
  fileName: string
  mimeType: string
}

export enum FILE_CATEGORY_ENUM {
  PASSPORT = 'passport',
  PROFILE_IMAGE = 'profile_image',
  ID_CARD = 'id_card',
  POWER_OF_ATTORNEY = 'power_of_attorney',
  APPROVAL_AGREEMENT = 'approval_agreement',
  OTHER = 'other',
}

export enum FILETYPE_ENUM {
  IMAGE = 'image',
  VIDEO = 'video',
  OTHER = 'other',
}

export type IFileType = `${FILETYPE_ENUM}`
export type IFileCategory = `${FILE_CATEGORY_ENUM}`
