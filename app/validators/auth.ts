import vine from '@vinejs/vine'
import { IUserRoleEnum } from '../interface/user.js'

export const registerUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(3),
    email: vine.string().email(),
    phoneNumber: vine.string().minLength(11),
    role: vine.enum(IUserRoleEnum),
    password: vine.string().minLength(6),
  })
)

export const loginUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(6),
  })
)
