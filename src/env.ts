
import { z } from 'zod';

const EnvironmentSchema = z.object({
  // Public (client-accessible) variables
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, "NEXT_PUBLIC_FIREBASE_API_KEY is required"),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required"),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, "NEXT_PUBLIC_FIREBASE_PROJECT_ID is required"),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is required"),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is required"),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, "NEXT_PUBLIC_FIREBASE_APP_ID is required"),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),

  // Server-only variables
  // GOOGLE_API_KEY is read by @genkit-ai/googleai from process.env.
  // We declare it as optional in the base schema because it's only truly required on the server.
  // A server-specific check is performed below.
  GOOGLE_API_KEY: z.string().optional(),
});

// Create a raw environment object by picking keys from process.env
// This helps Zod to not complain about extra keys in process.env when parsing.
const rawEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
};

const parsedEnv = EnvironmentSchema.safeParse(rawEnv);

if (!parsedEnv.success) {
  const fieldErrors = parsedEnv.error.flatten().fieldErrors;
  const errorMessages = Object.entries(fieldErrors)
    .map(([key, messages]) => `  - ${key}: ${messages?.join(', ')}`)
    .join('\n');
  console.error(
    '❌ Critical Error: Missing or invalid environment variables found:\n' +
    errorMessages +
    '\n\nPlease check your .env.local file or server configuration and ensure all required variables are set correctly. Restart your development server after making changes.'
  );
  throw new Error('Application startup failed due to missing/invalid environment variables.');
}

// Perform a stricter check for server-only variables when on the server.
if (typeof window === 'undefined') { // Running on the server
  const serverOnlySchema = z.object({
    GOOGLE_API_KEY: z.string().min(1, "GOOGLE_API_KEY is required on the server for Genkit Google AI plugin."),
  });
  const serverParsed = serverOnlySchema.safeParse(parsedEnv.data);
  if (!serverParsed.success) {
    const fieldErrors = serverParsed.error.flatten().fieldErrors;
    const errorMessages = Object.entries(fieldErrors)
      .map(([key, messages]) => `  - ${key}: ${messages?.join(', ')}`)
      .join('\n');
    console.error(
      '❌ Critical Server Error: Missing or invalid server-side environment variables:\n' +
      errorMessages +
      '\n\nPlease check your .env.local file or server configuration. Restart your development server after making changes.'
    );
    throw new Error('Application startup failed due to missing/invalid server-side environment variables.');
  }
}

export const env = parsedEnv.data;
