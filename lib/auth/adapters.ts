import type { Role, Session, User } from "@/lib/types/auth.ts";

const INVALID = Symbol("invalid");

function getProperty(source: unknown, key: string): unknown {
  if (typeof source !== "object" || source === null) {
    return undefined;
  }

  return Reflect.get(source, key);
}

function readBoolean(value: unknown): boolean | typeof INVALID {
  return typeof value === "boolean" ? value : INVALID;
}

function readDate(value: unknown): Date | typeof INVALID {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? INVALID : value;
  }

  if (typeof value !== "number" && typeof value !== "string") {
    return INVALID;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? INVALID : parsed;
}

function readNullableString(value: unknown): string | null | typeof INVALID {
  if (value === undefined || value === null) {
    return null;
  }

  return typeof value === "string" ? value : INVALID;
}

function readRole(value: unknown): Role | typeof INVALID {
  switch (value) {
    case "customer":
    case "admin":
    case "super_admin":
      return value;
    default:
      return INVALID;
  }
}

function readString(value: unknown): string | typeof INVALID {
  return typeof value === "string" ? value : INVALID;
}

export function toCanonicalUser(value: unknown): User | null {
  const id = readString(getProperty(value, "id"));
  const name = readString(getProperty(value, "name"));
  const email = readString(getProperty(value, "email"));
  const emailVerified = readBoolean(getProperty(value, "emailVerified"));
  const image = readNullableString(getProperty(value, "image"));
  const role = readRole(getProperty(value, "role"));
  const createdAt = readDate(getProperty(value, "createdAt"));
  const updatedAt = readDate(getProperty(value, "updatedAt"));

  if (
    id === INVALID ||
    name === INVALID ||
    email === INVALID ||
    emailVerified === INVALID ||
    image === INVALID ||
    role === INVALID ||
    createdAt === INVALID ||
    updatedAt === INVALID
  ) {
    return null;
  }

  return {
    id,
    name,
    email,
    emailVerified,
    image,
    role,
    createdAt,
    updatedAt,
  };
}

export function toCanonicalSession(value: unknown): Session | null {
  const id = readString(getProperty(value, "id"));
  const expiresAt = readDate(getProperty(value, "expiresAt"));
  const token = readString(getProperty(value, "token"));
  const createdAt = readDate(getProperty(value, "createdAt"));
  const updatedAt = readDate(getProperty(value, "updatedAt"));
  const ipAddress = readNullableString(getProperty(value, "ipAddress"));
  const userAgent = readNullableString(getProperty(value, "userAgent"));
  const userId = readString(getProperty(value, "userId"));

  if (
    id === INVALID ||
    expiresAt === INVALID ||
    token === INVALID ||
    createdAt === INVALID ||
    updatedAt === INVALID ||
    ipAddress === INVALID ||
    userAgent === INVALID ||
    userId === INVALID
  ) {
    return null;
  }

  return {
    id,
    expiresAt,
    token,
    createdAt,
    updatedAt,
    ipAddress,
    userAgent,
    userId,
  };
}
