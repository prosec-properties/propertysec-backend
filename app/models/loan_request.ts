import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import type { ILoanRequestStatus } from '#interfaces/loan'
import LoanFile from './loan_file.js'

export default class LoanRequest extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare amount: string

  @column()
  declare duration: string

  @column()
  declare noOfRooms: string

  @column()
  declare noOfYears: string

  @column()
  declare reasonForLoanRequest: string

  @column()
  declare status: ILoanRequestStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => LoanFile, {
    foreignKey: 'loanId'
  })
  declare files: HasMany<typeof LoanFile>

  @beforeCreate()
  static async createUUID(loanRequest: LoanRequest) {
    loanRequest.id = uuidv4()
  } 

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
