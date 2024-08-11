import env from "#start/env"
import encryption from "@adonisjs/core/services/encryption"
import { stringify } from "querystring"

export const setSearchParams = (params: Record<string, any>): string => {
  // const searchParams = new URLSearchParams()

  // for (const [key, value] of Object.entries(params)) {
  //   searchParams.set(key, String(value))
  // }

  // return searchParams.toString()

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