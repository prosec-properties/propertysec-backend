import env from '#start/env';
import { defineConfig, transports } from '@adonisjs/mail';
const mailConfig = defineConfig({
    default: 'smtp',
    mailers: {
        smtp: transports.smtp({
            host: env.get('SMTP_HOST'),
            port: env.get('SMTP_PORT'),
            auth: {
                type: 'login',
                user: env.get('SMTP_USERNAME'),
                pass: env.get('SMTP_PASSWORD'),
            },
        }),
    },
});
export default mailConfig;
//# sourceMappingURL=mail.js.map