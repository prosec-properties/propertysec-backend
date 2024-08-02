import { defineConfig } from '@adonisjs/core/app';
export default defineConfig({
    commands: [() => import('@adonisjs/core/commands'), () => import('@adonisjs/lucid/commands'), () => import('@adonisjs/mail/commands')],
    providers: [
        () => import('@adonisjs/core/providers/app_provider'),
        () => import('@adonisjs/core/providers/hash_provider'),
        {
            file: () => import('@adonisjs/core/providers/repl_provider'),
            environment: ['repl', 'test'],
        },
        () => import('@adonisjs/core/providers/vinejs_provider'),
        () => import('@adonisjs/cors/cors_provider'),
        () => import('@adonisjs/lucid/database_provider'),
        () => import('@adonisjs/auth/auth_provider'),
        () => import('@adonisjs/mail/mail_provider'),
        () => import('@adonisjs/core/providers/edge_provider'),
        () => import('@adonisjs/redis/redis_provider'),
        () => import('@adonisjs/limiter/limiter_provider'),
        () => import('@adonisjs/ally/ally_provider')
    ],
    preloads: [() => import('#start/routes'), () => import('#start/kernel'), () => import('#start/validator')],
    tests: {
        suites: [
            {
                files: ['tests/unit/**/*.spec(.ts|.js)'],
                name: 'unit',
                timeout: 2000,
            },
            {
                files: ['tests/functional/**/*.spec(.ts|.js)'],
                name: 'functional',
                timeout: 30000,
            },
        ],
        forceExit: false,
    },
    metaFiles: [{
            pattern: 'resources/views/**/*.edge',
            reloadServer: false,
        }]
});
//# sourceMappingURL=adonisrc.js.map