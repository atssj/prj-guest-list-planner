
'use server';
/**
 * @fileOverview An AI flow to parse guest information from a text transcript.
 *
 * - parseGuestInfo - A function that processes a transcript to extract guest details.
 * - ParseGuestInfoInput - The input type for the parseGuestInfo function.
 * - ParseGuestInfoOutput - The return type for the parseGuestInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
// FOOD_PREFERENCES is no longer used here as AI won't parse food preferences.

const ParseGuestInfoInputSchema = z.object({
  transcript: z.string().describe("The text transcript of the user's voice input."),
});
export type ParseGuestInfoInput = z.infer<typeof ParseGuestInfoInputSchema>;

const ParseGuestInfoOutputSchema = z.object({
  familyName: z.string().optional().describe("The extracted family name, e.g., 'The Sharma Family' or 'John Doe'."),
  adults: z.number().int().min(0).optional().describe("The number of adults."),
  children: z.number().int().min(0).optional().describe("The number of children."),
  // foodPreference field is removed as AI will not parse this detail anymore.
});
export type ParseGuestInfoOutput = z.infer<typeof ParseGuestInfoOutputSchema>;

export async function parseGuestInfo(input: ParseGuestInfoInput): Promise<ParseGuestInfoOutput> {
  return parseGuestInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseGuestInfoPrompt',
  input: {schema: ParseGuestInfoInputSchema},
  output: {schema: ParseGuestInfoOutputSchema},
  prompt: `You are an assistant helping to fill out a guest list form for an event.
The user will provide a spoken phrase as a transcript. Your task is to extract the following details:
- Family Name (e.g., "The Sharma Family", "John Doe and family", "My friend Priya")
- Number of Adults
- Number of Children

If a detail is not clearly mentioned, do not include it in your output.
If a number is mentioned for adults or children, convert it to an integer.
Do NOT attempt to extract food or meal preferences.

User input transcript: "{{{transcript}}}"

Extract the information and provide it in the structured output format.
Example: If user says "The Patel family, 2 adults, 1 child, they like vegetarian food", you should output:
{ familyName: "The Patel family", adults: 2, children: 1 }

Example: If user says "Riya and Simran, 2 adults", you should output:
{ familyName: "Riya and Simran", adults: 2 }

Example: If user says "Just my cousin anjali", you should output:
{ familyName: "My cousin Anjali", adults: 1 } (Assuming 1 adult if not specified with a family name)
`,
});

const parseGuestInfoFlow = ai.defineFlow(
  {
    name: 'parseGuestInfoFlow',
    inputSchema: ParseGuestInfoInputSchema,
    outputSchema: ParseGuestInfoOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
