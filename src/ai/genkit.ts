import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {env} from '@/env'; // Import to trigger environment variable validation

// The env.GOOGLE_API_KEY is validated by the import of '@/env' above if running on the server.
// The googleAI() plugin will pick up GOOGLE_API_KEY from process.env automatically.
// We don't need to explicitly pass env.GOOGLE_API_KEY to it, but importing '@/env' ensures our check runs.

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
