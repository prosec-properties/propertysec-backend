import { FIXED_TIME_VALUES } from '#constants/time'
import Otp from '#models/otp'
import User from '#models/user'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

export default class AuthTokenService {
  static async generateToken(user: User) {
    if (!user) return
    const token = uuidv4()

    const hasExistingOtp = await Otp.findBy('userId', user.id)

    if (hasExistingOtp) {
      await hasExistingOtp.delete()
    }

    const expiresAt = DateTime.now().plus({ minutes: FIXED_TIME_VALUES.TWENTY_MINUTES })

    await Otp.create({
      userId: user.id,
      code: token,
      expiresAt,
    })

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
