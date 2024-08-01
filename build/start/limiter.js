import limiter from '@adonisjs/limiter/services/main';
export const throttle = limiter.define('global', () => {
    return limiter.allowRequests(10).every('1 minute');
});
//# sourceMappingURL=limiter.js.map