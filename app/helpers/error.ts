import logger from '@adonisjs/core/services/logger'

export const getErrorObject = (
  error: any,
  options?: {
    message?: string
    log?: boolean
    consoleLog?: boolean
    [key: string]: any
  }
) => {
  const { message, log = true, consoleLog = false, ...others } = options || {}

  if (log) {
    logger.error(error, message || 'ERROR: Something went wrong')
  }

  if (consoleLog) {
    console.log(error)
  }

  return {
    message: message || 'ERROR: Something went wrong',
    error: error.messages?.errors ?? error.body?.errors,
    errorInfo: error.message,
    errorData: error,
    requestFail: true,
    ...others,
  }
}

export const errorResponse = (message: string) => {
  return {
    success: false,
    message: message || 'An error occurred',
  }
}
