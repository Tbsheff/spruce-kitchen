import { betterAuth } from "better-auth";

import { Resend } from "resend";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required for authentication — Better Auth cannot initialize without it"
  );
}

let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

interface AuthEmailUser {
  email: string;
  name?: string | null;
}

export const auth = betterAuth({
  // Database configuration — DATABASE_URL is guaranteed non-null by the
  // early throw above, so we wire the adapter unconditionally.
  database: {
    provider: "postgres",
    url: process.env.DATABASE_URL,
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 2, // 2 hours
    updateAge: 60 * 30, // 30 minutes (auto refresh)
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: !!process.env.RESEND_API_KEY,
    ...(resend && {
      sendResetPassword: async ({
        user,
        url,
      }: {
        user: AuthEmailUser;
        url: string;
      }) => {
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
        });
      },
      sendVerificationEmail: async ({
        user,
        url,
      }: {
        user: AuthEmailUser;
        url: string;
      }) => {
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
        });
      },
    }),
  },

  // Social providers
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

  // User configuration
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
      },
    },
  },

  // Security settings
  advanced: {
    generateId: () => crypto.randomUUID(),
  },
});

// Re-export the canonical types so callers importing from @/lib/auth keep
// working. Source of truth is the Drizzle schema via lib/types/auth.ts.
export type { Session, User } from "@/lib/types/auth.ts";
