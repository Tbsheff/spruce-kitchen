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
 * Recursively sanitize an object.
 *
 * Return type is preserved as the input type: this sanitizer rewrites string
 * values in place (HTML-encode, strip dangerous patterns) without changing
 * the shape, so callers don't need to re-narrow after the call. The inner
 * helper is typed as `(v: unknown) => unknown` because recursion crosses
 * arbitrary nested shapes; we cast once at the outer boundary.
 */
export function sanitizeObject<T>(obj: T): T {
  const walk = (value: unknown): unknown => {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === "string") {
      return sanitizeString(value);
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return value;
    }

    if (value instanceof Date) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((entry) => walk(entry));
    }

    if (typeof value === "object") {
      // Safe internal narrowing: TS cannot narrow `unknown` past `object`,
      // so hoist the cast to a single local for clarity.
      const record = value as Record<string, unknown>;
      const sanitized: Record<string, unknown> = {};
      for (const [key, entry] of Object.entries(record)) {
        // Sanitize both keys and values
        const sanitizedKey = sanitizeString(key);
        sanitized[sanitizedKey] = walk(entry);
      }
      return sanitized;
    }

    return value;
  };

  return walk(obj) as T;
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
      opts.input = sanitizeObject(opts.input);
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
 * Content Security Policy — nonce-based with 'strict-dynamic'.
 *
 * Production: script-src = 'self' + nonce + 'strict-dynamic'. No
 * 'unsafe-inline', no 'unsafe-eval'. Scripts loaded by a nonced script
 * inherit trust transitively.
 *
 * Development: adds 'unsafe-eval' (Turbopack/HMR evaluates rebuilt
 * modules via Function constructor) and ws:/wss: on connect-src (HMR
 * websocket). style-src keeps 'unsafe-inline' — Tailwind and the
 * Next.js font loader inject <style> tags that can't be nonced without
 * forking the framework; the XSS surface is limited because style
 * injection can't execute JS.
 */

export const NONCE_HEADER = "x-nonce";

function buildCSPSegments(isDev: boolean): { prefix: string; suffix: string } {
  const scriptTail = isDev
    ? "'strict-dynamic' 'wasm-unsafe-eval' 'unsafe-eval'"
    : "'strict-dynamic' 'wasm-unsafe-eval'";
  const connect = isDev ? "'self' ws: wss:" : "'self'";

  return {
    prefix: `default-src 'self'; script-src 'self' 'nonce-`,
    suffix:
      `' ${scriptTail}; ` +
      `style-src 'self' 'unsafe-inline'; ` +
      `img-src 'self' data: blob: https:; ` +
      `font-src 'self' data:; ` +
      `connect-src ${connect}; ` +
      `frame-src 'none'; ` +
      `object-src 'none'; ` +
      `base-uri 'self'; ` +
      `form-action 'self'; ` +
      `frame-ancestors 'none'`,
  };
}

const CSP_SEGMENTS = buildCSPSegments(process.env.NODE_ENV !== "production");

export function generateCSPHeader(nonce: string): string {
  return CSP_SEGMENTS.prefix + nonce + CSP_SEGMENTS.suffix;
}

export function generateCSPNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/=+$/, "");
}
