import logger from '@adonisjs/core/services/logger';
export const getErrorObject = (error, options) => {
    const { message, log = true, consoleLog = false, ...others } = options || {};
    if (log) {
        logger.error(error, message || 'ERROR: Something went wrong');
    }
    if (consoleLog) {
        console.log(error);
    }
    return {
        message: message || 'ERROR: Something went wrong',
        error: error.messages?.errors ?? error.body?.errors,
        errorInfo: error.message,
        errorData: error,
        requestFail: true,
        ...others,
    };
};
export const errorResponse = (message) => {
    return {
        success: false,
        message: message || 'An error occurred',
    };
};
//# sourceMappingURL=error.js.map