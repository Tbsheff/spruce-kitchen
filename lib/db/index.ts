import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

let db: ReturnType<typeof drizzle> | null = null

/**
 * Get database connection - requires DATABASE_URL to be configured
 */
function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required for database operations")
  }

  if (!db) {
    // Create postgres client
    const client = postgres(process.env.DATABASE_URL, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })

    // Create drizzle instance with schema
    db = drizzle(client, { schema })
  }

  return db
}

// Export database instance
export { getDatabase as db }

// Also export schema for convenience
export * from "./schema"
