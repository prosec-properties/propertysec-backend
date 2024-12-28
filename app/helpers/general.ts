import env from '#start/env'
import encryption from '@adonisjs/core/services/encryption'
import { stringify } from 'querystring'

export const setSearchParams = (params: Record<string, any>): string => {
  return new URLSearchParams(params).toString()
}

export const generateAuthUrl = (payload: any, key: string, url?: string) => {
  const urlPayload = {
    [key]: encryption.encrypt(payload, '20minutes'),
    email: payload.email,
  }
  const params = stringify(urlPayload)
  url = url || env.get('FRONTEND_AUTH_URL')
  return `${url}?${params}`
}

export const propertyCommission = (price: number, commission: number = 20): number => {
  return (price * commission) / 100
}
