import AuthController from '#controllers/auth';
import router from '@adonisjs/core/services/router';
import { middleware } from './kernel.js';
import UsersController from '#controllers/users_controller';
import SocialAuthController from '#controllers/social_auths_controller';
router.get('/', async () => {
    return {
        hello: 'world',
    };
});
router.get('/test', async ({ view }) => {
    return view.render('emails/verify_email_text');
});
router
    .group(() => {
    router
        .group(() => {
        router.post('/login', [AuthController, 'login']);
        router.post('/register', [AuthController, 'register']);
        router.post('/verify-otp', [AuthController, 'verifyOtp']);
        router.post('/resend-otp', [AuthController, 'resendOtp']);
        router.post('/forgot-password', [AuthController, 'forgotPassword']);
        router.post('/reset-password', [AuthController, 'resetPassword']);
        router.get('/google/callback', [SocialAuthController, 'googleCallback']);
        router.post('/complete-registration', [AuthController, 'completeRegistration']);
    })
        .prefix('auth');
    router
        .group(() => {
        router.get('/me', [UsersController, 'me']);
    })
        .use(middleware.auth())
        .prefix('users');
})
    .prefix('api/v1');
//# sourceMappingURL=routes.js.map