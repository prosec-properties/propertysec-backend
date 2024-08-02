import vine from '@vinejs/vine';
import { IUserRoleEnum } from '../interface/user.js';
export const registerUserValidator = vine.compile(vine.object({
    fullName: vine.string().trim().minLength(3),
    email: vine
        .string()
        .email()
        .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first();
        return !user;
    }),
    phoneNumber: vine
        .string()
        .minLength(11)
        .unique(async (db, value) => {
        const user = await db.from('users').where('phone_number', value).first();
        return !user;
    }),
    role: vine.enum(IUserRoleEnum),
    password: vine.string().minLength(6),
}));
export const loginUserValidator = vine.compile(vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(6),
}));
export const emailValidator = vine.compile(vine.object({
    email: vine.string().email().normalizeEmail(),
}));
export const resetPasswordValidator = vine.compile(vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(6),
    token: vine.string(),
}));
export const completeRegistrationValidator = vine.compile(vine.object({
    phoneNumber: vine.string().minLength(11),
    role: vine.enum(IUserRoleEnum),
    email: vine.string().email().normalizeEmail(),
}));
//# sourceMappingURL=auth.js.map