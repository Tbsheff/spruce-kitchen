interface Env {
  readonly DATABASE_URL: string | undefined;
  readonly NODE_ENV: string;
}

export const env: Env = {
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV ?? "development",
};
