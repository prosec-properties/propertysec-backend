import env from '#start/env';
import { defineConfig, stores } from '@adonisjs/limiter';
const limiterConfig = defineConfig({
    default: env.get('LIMITER_STORE'),
    stores: {
        redis: stores.redis({}),
        memory: stores.memory({}),
    },
});
export default limiterConfig;
//# sourceMappingURL=limiter.js.map