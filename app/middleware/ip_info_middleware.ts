// import type { HttpContext } from '@adonisjs/core/http'
// import type { NextFn } from '@adonisjs/core/types/http'

// export default class IpInfoMiddleware {
//   async handle(ctx: HttpContext, next: NextFn) {
//     /**
//      * Middleware logic goes here (before the next call)
//      */
//     console.log(ctx)

//     /**
//      * Call next method in the pipeline and return its output
//      */
//     const output = await next()
//     return output
//   }
// }

import type { HttpContext } from '@adonisjs/core/http'
import encryption from '@adonisjs/core/services/encryption'
import DeviceDetector from 'device-detector-js'
import * as console from 'console'


export type UserDeviceInformation = {
  ip: string
  city?: string
  country?: string
  cc?: string
  country_name?: string
  country_code?: string
  continent_name?: string
  continent_code?: string
  location?: string
  deviceInfo?: string
  device?: {
    os: string
    device: string
    browser: string
    bot: any
    browserVersion: string
    osVersion: string
    client: {
      engine: string
      engineVersion: string
      name: string
      type: string
      version: string
    }
  }
  emoji_flag?: string
  asn?: {
    asn: string
    domain: any
    name: string
    route: string
    type: string
  }
  calling_code?: string // 234
  carrier?: {
    mcc: string
    mnc: string
    name: string
  }
  count?: number
  currency?: {
    code: string
    name: string
    native: string
    plural: string
    symbol: string
  }
  emoji_unicode?: string
  flag?: string
  is_eu?: false
  languages?: {
    code: string
    name: string
    native: string
  }[]
  latitude?: number
  logged_in_at?: string
  longitude?: number
  postal?: any
  region?: string
  region_code?: string
  region_type?: string
  threat?: {
    blocklists: any[]
    is_anonymous: boolean
    is_bogon: boolean
    is_datacenter: boolean
    is_icloud_relay: boolean
    is_known_abuser: boolean
    is_known_attacker: boolean
    is_proxy: boolean
    is_threat: boolean
    is_tor: boolean
  }
  time_zone?: {
    abbr: string
    current_time: string
    is_dst: boolean
    name: string
    offset: string
  }
  [key: string]: any
}

export const getDevice = (userAgent: string) => {
  const deviceDetector = new DeviceDetector()
  const device = deviceDetector.parse(userAgent)
  return {
    ...device,
    os: device.os?.name,
    osVersion: device.os?.version,
    browser: device.client?.name,
    browserVersion: device.client?.version,
    device: `${device?.device?.brand ?? device.client?.name ?? ''} ${device.device?.model ?? ''}`,
  }
}

export default class IpInfo {
  public async handle(ctx: HttpContext, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    try {
      const { request } = ctx
      // Skip this middleware if the request is from the chat server
      if (request.header('XXX-Token') === 'lata-chat') {
        return await next()
      }
      // Get the IP address from the request
      const { IPA: requestIPA } = request.all()
      const IPA = requestIPA || request.header('XX-Client')
      // Set the IP address on the request body
      const ipInfo =
        (typeof IPA === 'string'
          ? (JSON.parse(encryption.base64.decode(IPA) ?? '{}') as any)?.data
          : IPA) || {}
      const device = getDevice(request.header('User-Agent') ?? '')

      if (ipInfo?.ip) {
        request.ip = () => ipInfo.ip
      }

      // ctx.ipInfo = {
      //   ...ipInfo,
      //   ip: ipInfo?.ip || request.ip(),
      //   location: `${ipInfo.city}, ${ipInfo.country_name} ${ipInfo.continent_name}`,
      //   deviceInfo: `${device.device} ${device.os} OS, from ${device.browser}`,
      //   device,
      // } as UserDeviceInformation
    } catch (e) {
      console.error(e)
    }
    await next()
  }
}
