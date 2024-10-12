import { DateTime } from 'luxon'
import { afterFetch, BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import type { AcceptedCurrencies, PlanName } from '#interfaces/payment'
// import type { Status } from '#interfaces/general'
import { v4 as uuidv4 } from 'uuid'

export default class Plan extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare features: string

  @column()
  declare price: number

  @column()
  declare currency: AcceptedCurrencies

  @column()
  declare name: PlanName

  // duration in months e.g 1, 3, 6, 12
  @column()
  declare duration: number

  @column()
  declare order: number

  @column()
  declare meta?: string

  @column({ serializeAs: 'discountPercentage' })
  declare discountPercentage?: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async generateId(data: Plan) {
    if (!data.$dirty.id) {
      data.id = uuidv4()
    }
  }

  @afterFetch()
  static async parseData(data: Plan[]) {
    data.forEach((plan) => {
      if (plan.features) {
        plan.features = JSON.parse(plan.features)
      }
      if (plan.meta) {
        plan.meta = JSON.parse(plan.meta)
      }
    })
  }
}
