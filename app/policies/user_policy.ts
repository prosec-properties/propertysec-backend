import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'

export default class UserPolicy extends BasePolicy {
  isAdmin(user: User) {
    return user.role === 'admin'
  }
  canUploadProperties(user: User) {
    return ['admin', 'developer', 'landlord', 'lawyer'].includes(user.role)
  }
  isAffiliate(user: User) {
    return user.role === 'affiliate'
  }
}
