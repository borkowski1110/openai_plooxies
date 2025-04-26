import { createEnv } from "@t3-oss/env-core";

// build-time values only
export const env = createEnv({
  clientPrefix: "VITE_PUBLIC_",
  client: {
    // VITE_PUBLIC_SOMETHING: z.string(),
  },
  runtimeEnv: import.meta.env,
});
