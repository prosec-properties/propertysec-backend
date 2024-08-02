export default class LoggerMiddleware {
    async handle({ request, logger }, next) {
        const query = request.qs();
        const queryKeys = Object.keys(query);
        let queryStr = '';
        queryKeys.forEach((key, i) => {
            queryStr += `${i > 0 ? '&' : '?'}${key}=${query[key]}`;
        });
        const logMessage = `${request.method()}-${request.url()}${queryStr} | User Agent - ${request.headers()['user-agent']} | Request IP - ${request.ip()}`;
        logger.info({
            body: request.body(),
            files: request.files('files'),
        }, logMessage);
        console.log(logger);
        const output = await next();
        return output;
    }
}
//# sourceMappingURL=logger_middleware.js.map