import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
  isAdmin(user: User) {
    return user.role === 'admin'
  }
}
