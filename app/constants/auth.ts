export const REDIS_VERIFY_EMAIL_PREFIX = 've-otp:'
export const REDIS_USER_EMAIL = 'user-id:'
export const REDIS_RESET_PASSWORD_PREFIX = 'rp-otp:'

export const EMAIL_TEMPLATES = {
  VERIFY_EMAIL: 'emails/verify_email_html',
  RESET_PASSWORD: 'emails/reset_password',
  // VERIFY_EMAIL_OTP: 'emails/verify_email_otp',
  // RESET_PASSWORD_OTP: 'emails/reset_password_otp',
} as const

export const OTP_LENGTH = 6
export const RANDOM_OTP_NUMBERS = '1234567890'
