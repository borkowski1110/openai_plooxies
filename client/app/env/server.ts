import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// build-time & runtime values
export const env = createEnv({
  server: {
    SUPABASE_URL: z.string(),
    SUPABASE_ANON_KEY: z.string(),
  },
  runtimeEnvStrict: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
});
