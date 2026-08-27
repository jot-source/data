import { z } from 'zod'

// Email/password bounds enforced server-side — the client forms (sign-up,
// reset-password pages) already check these, but server actions must never
// trust client-side checks alone since they can be bypassed by calling the
// action directly.
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email is required.')
  .max(255, 'Email is too long.')
  .email('Enter a valid email address.')

// Internal alias so existing object schemas that embed `email` don't break.
const email = emailSchema

// Sign-up / reset password rule shown in the UI as "Use 8+ characters and one
// number." Capped at 128 so an oversized payload can't be pushed into Supabase.
const PASSWORD_RULE = 'Use 8+ characters and one number.'
const newPassword = z
  .string()
  .min(8, PASSWORD_RULE)
  .max(128, 'Password is too long.')
  .regex(/[0-9]/, PASSWORD_RULE)

export const signUpSchema = z.object({
  email,
  password: newPassword,
})

export const signInSchema = z.object({
  email,
  // Signing in just checks an existing credential, so only bound the length —
  // don't re-enforce the creation-time complexity rule here.
  password: z.string().min(1, 'Password is required.').max(128, 'Password is too long.'),
})

export const forgotPasswordSchema = z.object({
  email,
})

export const resetPasswordSchema = z.object({
  newPassword,
})

// Sign-up email verification: the 8-digit code Supabase emails after signUp.
export const signupOtpSchema = z.object({
  email,
  token: z
    .string()
    .trim()
    .regex(/^\d{8}$/, 'Enter the 8-digit code from your email'),
})

// OTP-based password reset: the user supplies the email, the 8-digit recovery
// code from the email, and their new password in a single step.
export const verifyResetOtpSchema = z.object({
  email,
  token: z
    .string()
    .trim()
    .regex(/^\d{8}$/, 'Enter the 8-digit code from your email'),
  newPassword,
})

// Profile-setup step — all fields optional/skippable. `fullName` defaults to the
// email prefix server-side when left blank. `jobTitle` is the user's self-described
// role (e.g. "Project Manager"), not the app permission role.
export const profileSchema = z.object({
  fullName: z.string().trim().max(120, 'Name is too long.').optional(),
  organization: z.string().trim().max(160, 'Organization is too long.').optional(),
  industry: z.string().trim().max(120, 'Industry is too long.').optional(),
  jobTitle: z.string().trim().max(120, 'Role is too long.').optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type VerifyResetOtpInput = z.infer<typeof verifyResetOtpSchema>
export type SignupOtpInput = z.infer<typeof signupOtpSchema>
