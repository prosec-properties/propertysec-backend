import User from '#models/user'

export default class UserService {
  static async emailIsVerified(user: User) {
    try {
      user.emailVerified = true
      user.save()
    } catch (error) {
      throw error
    }
  }
}
