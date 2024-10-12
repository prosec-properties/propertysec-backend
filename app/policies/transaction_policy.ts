import User from '#models/user'
import Transaction from '#models/transaction'
import { BasePolicy } from '@adonisjs/bouncer'

export default class TransactionPolicy extends BasePolicy {
  public async view(user: User, transaction: Transaction) {
    return user.id === transaction.userId || user.role === 'admin'
  }
}
