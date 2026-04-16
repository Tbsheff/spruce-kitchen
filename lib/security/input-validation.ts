/**
 * Input Validation and XSS Protection
 *
 * Provides sanitization middleware for tRPC procedures to prevent:
 * - XSS attacks
 * - SQL injection (additional layer)
 * - NoSQL injection
 * - Path traversal
 * - Malicious input patterns
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";

// Dangerous patterns that should be blocked
const DANGEROUS_PATTERNS = [
  // XSS patterns
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,

  // SQL injection patterns
  /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b).*?(\bFROM\b|\bINTO\b|\bWHERE\b)/gi,
  /(\bOR\b|\bAND\b)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/gi,
  /['"];?\s*(DROP|DELETE|INSERT|UPDATE|SELECT)/gi,

  // NoSQL injection patterns
  /\$where/gi,
  /\$ne/gi,
  /\$regex/gi,
  /\$gt/gi,
  /\$lt/gi,

  // Path traversal
  /\.\.[/\\]/g,
  /[/\\]\.\.[/\\]/g,
];

// HTML entities for basic XSS prevention
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

// Basic email shape check — not exhaustive, but enough to reject obvious garbage.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Allowed characters for opaque IDs (UUIDs, nanoids, slugs).
const ID_RE = /^[a-zA-Z0-9_-]+$/;

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return input;
  }

  // HTML encode dangerous characters
  let sanitized = input.replace(
    /[&<>"'/]/g,
    (char) => HTML_ENTITIES[char] || char
  );

  // Remove dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }

  // Remove null bytes and control characters
  // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional — this sanitizer strips control characters for security
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Limit length to prevent DoS
  if (sanitized.length > 10_000) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Input too long",
    });
  }

  return sanitized.trim();
}

/**
 * Validate and sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeString(email);

  // Basic email validation
  if (!EMAIL_RE.test(sanitized)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid email format",
    });
  }

  return sanitized.toLowerCase();
}

/**
 * Validate and sanitize IDs (UUIDs, nanoids, etc.)
 */
export function sanitizeId(id: string): string {
  const sanitized = sanitizeString(id);

  // Allow only alphanumeric, hyphens, and underscores
  if (!ID_RE.test(sanitized)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid ID format",
    });
  }

  if (sanitized.length < 1 || sanitized.length > 100) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "ID length must be between 1 and 100 characters",
    });
  }

  return sanitized;
}

/**
 * Recursively sanitize an object
 */
export function sanitizeObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  if (typeof obj === "number" || typeof obj === "boolean") {
    return obj;
  }

  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((value) => sanitizeObject(value));
  }

  if (typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      // Sanitize both keys and values
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Input validation Zod schemas
 */
export const secureString = (minLength?: number, maxLength?: number) => {
  let schema = z.string();
  if (minLength !== undefined) {
    schema = schema.min(minLength);
  }
  if (maxLength !== undefined) {
    schema = schema.max(maxLength);
  }
  return schema.transform(sanitizeString);
};

export const secureEmail = () => z.string().transform(sanitizeEmail);
export const secureId = () => z.string().transform(sanitizeId);

// Backward compatibility
export const secureStringSchema = z.string().transform(sanitizeString);
export const secureEmailSchema = z.string().transform(sanitizeEmail);
export const secureIdSchema = z.string().transform(sanitizeId);

/**
 * Create a sanitizing transform for Zod schemas
 */
export function sanitized<T extends z.ZodType>(schema: T) {
  return schema.transform((value) => sanitizeObject(value));
}

/**
 * Middleware for tRPC procedures to sanitize all inputs
 */
export const inputSanitizationMiddleware = <
  T extends Record<string, unknown>,
>(opts: {
  ctx: unknown;
  next: () => Promise<unknown>;
  input?: T;
}): Promise<unknown> => {
  // Sanitize input if present
  if (opts.input) {
    try {
      opts.input = sanitizeObject(opts.input) as T;
    } catch (_error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid input detected",
      });
    }
  }

  return opts.next();
};

// Deprecated function removed - use DatabaseRateLimiter.checkRateLimit instead

/**
 * Content Security Policy helpers
 */
export const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'wasm-unsafe-eval'"], // Next.js requires wasm-unsafe-eval for compilation
  "style-src": ["'self'", "'unsafe-inline'"], // Next.js requires unsafe-inline for CSS-in-JS
  "img-src": ["'self'", "data:", "https:"],
  "font-src": ["'self'"],
  "connect-src": ["'self'"],
  "frame-src": ["'none'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
};

export function generateCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
    .join("; ");
}
