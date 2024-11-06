import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'

export default class UserPolicy extends BasePolicy {
  isAdmin(user: User) {
    return user.role === 'admin'
  }
}
