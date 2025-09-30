export type Env = Record<string, unknown>;

// Type guard for environment validation
export function validateEnv(env: unknown): env is Env {
  // Add your environment validation logic here
  return typeof env === 'object' && env !== null;
}
