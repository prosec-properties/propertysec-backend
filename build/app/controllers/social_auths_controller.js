import { getGoogleUserProfile } from '#helpers/auth';
import { errorResponse } from '#helpers/error';
import User from '#models/user';
import AuthToken from '#services/token';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
export default class SocialAuthController {
    async googleCallback({ response, request }) {
        try {
            const { accessToken, credential } = request.all();
            let profile = {};
            if (credential) {
                const data = jwt.decode(credential);
                profile = data;
            }
            if (accessToken) {
                const data = await getGoogleUserProfile(accessToken);
                profile = data;
            }
            const userDetails = {
                email: profile.email,
                fullName: profile.name,
                token: profile.token,
                avatar: profile.picture,
            };
            if (!userDetails.email) {
                return response.badRequest({
                    success: false,
                    message: 'Email is required',
                });
            }
            const { user, isNew } = await this.generateUserDetails({
                name: userDetails.fullName,
                email: userDetails.email,
                avatar: userDetails.avatar,
                role: 'buyer',
            });
            if (!user) {
                return response.badRequest({
                    success: false,
                    message: 'Could not create user',
                });
            }
            let token;
            if (!isNew && user.hasCompletedRegistration) {
                token = await AuthToken.generateAuthToken(user);
            }
            return response.ok({
                success: true,
                isNew,
                user,
                token: token || null,
            });
        }
        catch (error) {
            return response.badRequest(errorResponse(error.message));
        }
    }
    async generateUserDetails({ name, email, avatar, role, }) {
        const user = {
            fullName: name,
            email,
            password: uuidv4(),
            role: role || 'buyer',
            emailVerified: true,
            hasCompletedProfile: false,
            hasCompletedRegistration: false,
            avatarUrl: avatar,
            authProvider: 'google',
        };
        const userInDataBase = await User.query().orWhere('email', user.email).first();
        if (!userInDataBase) {
            const newUser = await User.create(user);
            return {
                user: newUser,
                isNew: true,
            };
        }
        if (!userInDataBase.emailVerified) {
            userInDataBase.emailVerified = true;
        }
        if (!userInDataBase.avatarUrl && user.avatarUrl) {
            userInDataBase.avatarUrl = user.avatarUrl;
        }
        await userInDataBase.save();
        return {
            user: userInDataBase,
            isNew: false,
        };
    }
}
//# sourceMappingURL=social_auths_controller.js.map