import { REDIS_RESET_PASSWORD_PREFIX, REDIS_VERIFY_EMAIL_PREFIX } from '#constants/auth'
import { FIXED_TIME_VALUES } from '#constants/time'
import User from '#models/user'
import redis from '@adonisjs/redis/services/main'
import { v4 as uuidv4 } from 'uuid'

export default class AuthTokenService {
  static async generatePasswordResetToken(user: User | null) {
    const token = uuidv4()

    if (!user) return token

    // Key is ignored if it is not available
    await redis.del(`${REDIS_RESET_PASSWORD_PREFIX}${user.id}`)

    await redis.setex(
      `${REDIS_RESET_PASSWORD_PREFIX}${user.id}`,
      FIXED_TIME_VALUES.TWENTY_MINUTES,
      token
    )

    return token
  }

  async generateVerifyEmailToken(user: User | null) {
    const token = uuidv4()

    if (!user) return token

    // Key is ignored if it is not available
    await redis.del(`${REDIS_VERIFY_EMAIL_PREFIX}${user.id}`)

    await redis.set(`${REDIS_VERIFY_EMAIL_PREFIX}${user.id}`, token)

    return token
  }

  async emailIsVerified(user: User) {
    user.emailVerified = true

    user.save()
  }

  static async generateAuthToken(user: User) {
    try {
      const existingToken = await User.accessTokens.all(user)

      if (existingToken && existingToken.length > 0) {
        await User.accessTokens.delete(user, existingToken[0].identifier)
      }

      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: `${FIXED_TIME_VALUES.ONE_MONTH} days`,
      })

      return token
    } catch (error) {
      throw error
    }
  }

  static async revokeAuthToken(user: User) {
    try {
      const existingToken = await User.accessTokens.all(user)

      if (existingToken && existingToken.length > 0) {
        await User.accessTokens.delete(user, existingToken[0].identifier)
      }
    } catch (error) {
      throw error
    }
  }
}
