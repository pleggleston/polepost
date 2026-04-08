import { z } from 'zod';

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1)
});

export function getServerEnv() {
  const parsedServerEnv = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  });

  if (!parsedServerEnv.success) {
    throw new Error(`Invalid server environment variables: ${parsedServerEnv.error.message}`);
  }

  return parsedServerEnv.data;
}
