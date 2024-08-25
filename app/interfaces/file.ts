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
  tmpPath: string;
  size: number;
  clientName: string;
  type: string;
  subtype: string;
  fieldName: string;
  fileName: string;
  mimeType: string;
}
