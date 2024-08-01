import { REDIS_RESET_PASSWORD_PREFIX, REDIS_VERIFY_EMAIL_PREFIX } from '#constants/auth';
import { FIXED_TIME_VALUES } from '#constants/time';
import User from '#models/user';
import redis from '@adonisjs/redis/services/main';
import { v4 as uuidv4 } from 'uuid';
export default class AuthTokenService {
    static async generatePasswordResetToken(user) {
        const token = uuidv4();
        if (!user)
            return token;
        await redis.del(`${REDIS_RESET_PASSWORD_PREFIX}${user.id}`);
        await redis.setex(`${REDIS_RESET_PASSWORD_PREFIX}${user.id}`, FIXED_TIME_VALUES.TWENTY_MINUTES, token);
        return token;
    }
    async generateVerifyEmailToken(user) {
        const token = uuidv4();
        if (!user)
            return token;
        await redis.del(`${REDIS_VERIFY_EMAIL_PREFIX}${user.id}`);
        await redis.set(`${REDIS_VERIFY_EMAIL_PREFIX}${user.id}`, token);
        return token;
    }
    async emailIsVerified(user) {
        user.emailVerified = true;
        user.save();
    }
    static async generateAuthToken(user) {
        try {
            const existingToken = await User.accessTokens.all(user);
            if (existingToken.length > 0) {
                await User.accessTokens.delete(user, existingToken[0].identifier);
            }
            const token = await User.accessTokens.create(user, ['*'], {
                expiresIn: FIXED_TIME_VALUES.ONE_MONTH,
            });
            return token;
        }
        catch (error) {
            throw error;
        }
    }
}
//# sourceMappingURL=token.js.map