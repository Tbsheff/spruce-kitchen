// Database connection will be set up when DATABASE_URL is configured
// For now, export placeholder functions to prevent import errors

export const db = {
  insert: () => ({
    values: () => Promise.resolve({ id: crypto.randomUUID() }),
  }),
}

// Placeholder schema exports
export const user = {}
export const session = {}
export const account = {}
export const verification = {}
export const mealPlan = {}
export const order = {}
