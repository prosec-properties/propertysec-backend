import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'

export default class InspectionDetail extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare inspectionAmount: number

  @column()
  declare inspectionStatus: 'PENDING' | 'COMPLETED'

  @column()
  declare inspectionReport: string

  @column()
  declare userId: string

  @column()
  declare propertyId: string

  @column()
  declare name: string

  @column()
  declare email: string 

  @column()
  declare phoneNumber: string

  @column()
  declare inspectionDate: string

  @column()
  declare meta?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static generateId(inspectionDetail: InspectionDetail) {
    inspectionDetail.id = uuidv4()
  }
}