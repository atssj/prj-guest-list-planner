
'use server';
/**
 * @fileOverview An AI flow to process individual guest utterances in a conversational manner.
 *
 * - processGuestUtterance - A function that processes a user's utterance based on the current conversation stage.
 * - ProcessGuestUtteranceInput - The input type for the processGuestUtterance function.
 * - ProcessGuestUtteranceOutput - The return type for the processGuestUtterance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessGuestUtteranceInputSchema = z.object({
  stage: z.enum(['familyName', 'adults', 'children', 'confirm'])
    .describe("The current stage of the conversation, determining what information is being asked for."),
  utterance: z.string().describe("The user's spoken response (transcript)."),
  currentFamilyName: z.string().optional().describe("The family name collected so far, if any. Relevant for 'adults', 'children', 'confirm' stages."),
  currentAdults: z.number().int().min(0).optional().describe("Number of adults collected so far. Relevant for 'children', 'confirm' stages."),
  currentChildren: z.number().int().min(0).optional().describe("Number of children collected so far. Relevant for 'confirm' stage."),
});
export type ProcessGuestUtteranceInput = z.infer<typeof ProcessGuestUtteranceInputSchema>;

const ProcessGuestUtteranceOutputSchema = z.object({
  extractedFamilyName: z.string().optional().describe("The family name extracted from this utterance, if the stage was 'familyName'."),
  extractedAdults: z.number().int().min(0).optional().describe("Number of adults extracted, if the stage was 'adults'."),
  extractedChildren: z.number().int().min(0).optional().describe("Number of children extracted, if the stage was 'children'."),
  isConfirmed: z.boolean().optional().describe("True if the user confirmed the details (stage 'confirm'), false if they denied or response was unclear."),
  parsingError: z.string().optional().describe("Description of an error if parsing failed for the current stage or input was unclear."),
  nextAiPrompt: z.string().optional().describe("A suggested natural language prompt for the AI to ask the user next (for UI display)."),
});
export type ProcessGuestUtteranceOutput = z.infer<typeof ProcessGuestUtteranceOutputSchema>;


export async function processGuestUtterance(input: ProcessGuestUtteranceInput): Promise<ProcessGuestUtteranceOutput> {
  return processGuestUtteranceFlow(input);
}

// Helper to construct the dynamic part of the prompt
function buildPromptForStage(input: ProcessGuestUtteranceInput): string {
  let promptSegment = `You are a helpful assistant gathering guest information for an event. The user's response to your last question was: "{{{utterance}}}"\n`;

  switch (input.stage) {
    case 'familyName':
      promptSegment += `You asked for the family name or primary guest's name. Extract this name.
If a name is extracted, suggest the next question: "Got it. How many adults will be in the [Family Name] party?"
If you cannot determine a name, set parsingError.`;
      break;
    case 'adults':
      promptSegment += `The family name is "${input.currentFamilyName || 'the family'}". You asked for the number of adults. Extract the number of adults (as an integer).
If a number is extracted, suggest the next question: "And how many children will be with them?"
If you cannot determine the number of adults, set parsingError. Assume 0 if they explicitly say "zero" or "none".`;
      break;
    case 'children':
      promptSegment += `The family name is "${input.currentFamilyName || 'the family'}" and there are ${input.currentAdults || 0} adults. You asked for the number of children. Extract the number of children (as an integer).
If a number is extracted, suggest the next question: "Great! So, just to confirm: [Family Name], ${input.currentAdults || 0} adult(s), and [extracted children] child(ren). Is that correct? (Please say Yes or No)"
If you cannot determine the number of children, set parsingError. Assume 0 if they explicitly say "zero" or "none".`;
      break;
    case 'confirm':
      promptSegment += `You presented the summary: "${input.currentFamilyName || 'Unknown family'}", ${input.currentAdults || 0} adult(s), and ${input.currentChildren || 0} child(ren). You asked for confirmation (Yes/No).
Determine if the user's response means "Yes" (confirm) or "No" (deny). Set isConfirmed accordingly.
If "Yes", suggest the next prompt: "Excellent! I've noted that down. You can now review meal preferences or add another guest."
If "No", suggest the next prompt: "Okay, let's try that again. What is the family name?" (This will restart the process)
If the response is unclear for confirmation, set parsingError and suggest: "Sorry, I didn't catch that. Is the information correct, yes or no?"`;
      break;
  }
  return promptSegment;
}

const processGuestUtteranceFlow = ai.defineFlow(
  {
    name: 'processGuestUtteranceFlow',
    inputSchema: ProcessGuestUtteranceInputSchema,
    outputSchema: ProcessGuestUtteranceOutputSchema,
  },
  async (input) => {
    const dynamicPromptContent = buildPromptForStage(input);

    const prompt = ai.definePrompt({
        name: 'processGuestUtterancePrompt', // Each call makes a new prompt object, could be optimized if needed
        input: { schema: ProcessGuestUtteranceInputSchema },
        output: { schema: ProcessGuestUtteranceOutputSchema },
        prompt: dynamicPromptContent, 
    });

    const {output} = await prompt(input); // Pass the original input, Handlebars will use it
    
    // Ensure numbers are indeed numbers if extracted
    if (output?.extractedAdults !== undefined && isNaN(Number(output.extractedAdults))) {
        output.parsingError = `Expected a number for adults, but couldn't parse one from "${input.utterance}".`;
        output.extractedAdults = undefined;
    }
    if (output?.extractedChildren !== undefined && isNaN(Number(output.extractedChildren))) {
        output.parsingError = `Expected a number for children, but couldn't parse one from "${input.utterance}".`;
        output.extractedChildren = undefined;
    }
    
    return output!;
  }
);
