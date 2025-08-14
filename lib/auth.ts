import { betterAuth } from "better-auth"

let resend: any = null
if (process.env.RESEND_API_KEY) {
  const { Resend } = require("resend")
  resend = new Resend(process.env.RESEND_API_KEY)
}

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.RESEND_API_KEY ? true : false, // Only require verification if Resend is configured
    ...(resend && {
      sendResetPassword: async ({ user, url }) => {
        await resend.emails.send({
          from: "Spruce Kitchen <noreply@sprucekitchen.com>",
          to: user.email,
          subject: "Reset Your Password - Spruce Kitchen",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #E28441;">Reset Your Password</h1>
              <p>Hi ${user.name || "there"},</p>
              <p>You requested to reset your password for your Spruce Kitchen account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${url}" style="background-color: #E28441; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Reset Password</a>
              <p>If you didn't request this, you can safely ignore this email.</p>
              <p>This link will expire in 1 hour for security reasons.</p>
              <p>Best regards,<br>The Spruce Kitchen Team</p>
            </div>
          `,
        })
      },
      sendVerificationEmail: async ({ user, url }) => {
        await resend.emails.send({
          from: "Spruce Kitchen <noreply@sprucekitchen.com>",
          to: user.email,
          subject: "Verify Your Email - Spruce Kitchen",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #E28441;">Welcome to Spruce Kitchen!</h1>
              <p>Hi ${user.name || "there"},</p>
              <p>Thanks for signing up! Please verify your email address to complete your account setup.</p>
              <a href="${url}" style="background-color: #E28441; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Verify Email</a>
              <p>If you didn't create this account, you can safely ignore this email.</p>
              <p>Best regards,<br>The Spruce Kitchen Team</p>
            </div>
          `,
        })
      },
    }),
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
    },
  },
  advanced: {
    generateId: () => crypto.randomUUID(),
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.User
