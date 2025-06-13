
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
  nextAiPrompt: z.string().describe("A suggested natural language prompt for the AI to ask the user next (for UI display). This should ALWAYS be populated."),
});
export type ProcessGuestUtteranceOutput = z.infer<typeof ProcessGuestUtteranceOutputSchema>;


export async function processGuestUtterance(input: ProcessGuestUtteranceInput): Promise<ProcessGuestUtteranceOutput> {
  return processGuestUtteranceFlow(input);
}

// Helper to construct the dynamic part of the prompt
function buildPromptForStage(input: ProcessGuestUtteranceInput): string {
  let promptSegment = `You are a helpful assistant gathering guest information for an event. The user's response to your last question was: "{{{utterance}}}"\nAlways provide a 'nextAiPrompt'.\n`;

  switch (input.stage) {
    case 'familyName':
      promptSegment += `You asked for the family name or primary guest's name. Your primary goal is to extract this name and populate the 'extractedFamilyName' field.
If a family name is successfully extracted:
  - Populate 'extractedFamilyName' with this name.
  - Set 'nextAiPrompt' to: "Got it. How many adults will be in the {{{extractedFamilyName}}} party?"
If you CANNOT determine a name from the utterance:
  - Set 'parsingError' to "I couldn't catch the family name. Could you please repeat it?"
  - Set 'nextAiPrompt' to: "I'm sorry, I didn't quite get the name. Could you please tell me the family name or primary guest's name again?"`;
      break;
    case 'adults':
      promptSegment += `The family name is "${input.currentFamilyName || 'the family'}". You asked for the number of adults. Your primary goal is to extract the number of adults as an integer and populate the 'extractedAdults' field.
If a number for adults is successfully extracted:
  - Populate 'extractedAdults' with this number.
  - Set 'nextAiPrompt' to: "And how many children will be with them?"
If you CANNOT determine the number of adults from the utterance:
  - Set 'parsingError' to "I couldn't understand the number of adults. Could you please repeat how many adults?"
  - Do NOT attempt to extract or re-extract the family name at this stage.
  - Set 'nextAiPrompt' to: "My apologies, I didn't catch that. How many adults will be in the ${input.currentFamilyName || 'family'} party?"
Assume 0 for adults if the user explicitly says "zero" or "none".`;
      break;
    case 'children':
      promptSegment += `The family name is "${input.currentFamilyName || 'the family'}" and there are ${input.currentAdults ?? 'an unknown number of'} adults. You asked for the number of children. Your primary goal is to extract the number of children as an integer and populate the 'extractedChildren' field.
If a number for children is successfully extracted:
  - Populate 'extractedChildren' with this number.
  - Set 'nextAiPrompt' to: "Great! So, just to confirm: ${input.currentFamilyName || 'The family'}, ${input.currentAdults ?? 'some'} adult(s), and {{{extractedChildren}}} child(ren). Is that correct? (Please say Yes or No)"
If you CANNOT determine the number of children from the utterance:
  - Set 'parsingError' to "I couldn't understand the number of children. Could you please repeat how many children?"
  - Do NOT attempt to extract or re-extract other details at this stage.
  - Set 'nextAiPrompt' to: "Sorry, I missed the number of children. How many children will be joining them?"
Assume 0 for children if the user explicitly says "zero" or "none".`;
      break;
    case 'confirm':
      promptSegment += `You presented the summary: "${input.currentFamilyName || 'Unknown family'}", ${input.currentAdults ?? 'some'} adult(s), and ${input.currentChildren ?? 'some'} child(ren). You asked for confirmation (Yes/No). Your primary goal is to determine if the user's response means "Yes" (confirm) or "No" (deny) and populate the 'isConfirmed' field.
If the user confirms ("Yes", "Correct", "Sounds good"):
  - Set 'isConfirmed' to true.
  - Set 'nextAiPrompt' to: "Excellent! I've noted that down. You can now review meal preferences or add another guest."
If the user denies ("No", "Incorrect", "That's wrong"):
  - Set 'isConfirmed' to false.
  - Set 'nextAiPrompt' to: "Okay, let's try that again. What is the family name?"
If the user's response is unclear for confirmation (neither a clear "Yes" nor "No"):
  - Set 'parsingError' to "Sorry, I didn't quite catch that. Is the information correct, yes or no?"
  - Do not set 'isConfirmed'.
  - Set 'nextAiPrompt' to: "I need a clear Yes or No to confirm. Is the information: ${input.currentFamilyName || 'Unknown family'}, ${input.currentAdults ?? 'some'} adult(s), and ${input.currentChildren ?? 'some'} child(ren) correct?"`;
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
        name: 'processGuestUtterancePrompt', 
        input: { schema: ProcessGuestUtteranceInputSchema },
        output: { schema: ProcessGuestUtteranceOutputSchema },
        prompt: dynamicPromptContent,
    });

    const {output} = await prompt(input); 
    
    if (output) {
        if (output.extractedAdults !== undefined) {
            if (isNaN(Number(output.extractedAdults))) {
                output.parsingError = output.parsingError || `Expected a number for adults, but couldn't parse one from "${input.utterance}".`;
                output.extractedAdults = undefined;
                if (!output.nextAiPrompt) { // Ensure nextAiPrompt is set even if AI missed it
                    output.nextAiPrompt = `My apologies, I didn't catch that. How many adults will be in the ${input.currentFamilyName || 'family'} party?`;
                }
            } else if (input.stage === 'adults' && output.parsingError && output.parsingError.toLowerCase().includes('adults')) {
                // If adults were successfully parsed as a number, but AI also set a parsingError specifically for adults,
                // let's favor the parsed number and clear the specific error, assuming AI resolved it but left a trace.
                // The 'nextAiPrompt' should have been set for success by the LLM.
                const successfullyExtractedAdults = Number(output.extractedAdults);
                if (!isNaN(successfullyExtractedAdults)) {
                     output.parsingError = undefined; // Clear the specific adult parsing error.
                     if (!output.nextAiPrompt || output.nextAiPrompt.toLowerCase().includes("adults")) { // If AI still asks about adults, override
                        output.nextAiPrompt = "And how many children will be with them?";
                     }
                }
            }
        }
        if (output.extractedChildren !== undefined) {
             if (isNaN(Number(output.extractedChildren))) {
                output.parsingError = output.parsingError || `Expected a number for children, but couldn't parse one from "${input.utterance}".`;
                output.extractedChildren = undefined;
                 if (!output.nextAiPrompt) {
                    output.nextAiPrompt = `Sorry, I missed the number of children. How many children will be joining them?`;
                 }
            } else if (input.stage === 'children' && output.parsingError && output.parsingError.toLowerCase().includes('children')) {
                const successfullyExtractedChildren = Number(output.extractedChildren);
                 if (!isNaN(successfullyExtractedChildren)) {
                    output.parsingError = undefined;
                    if (!output.nextAiPrompt || output.nextAiPrompt.toLowerCase().includes("children")) {
                         output.nextAiPrompt = `Great! So, just to confirm: ${input.currentFamilyName || 'The family'}, ${input.currentAdults ?? 'some'} adult(s), and ${successfullyExtractedChildren} child(ren). Is that correct? (Please say Yes or No)`;
                    }
                 }
            }
        }
        // Ensure nextAiPrompt is always populated as a last resort
        if (!output.nextAiPrompt) {
            output.nextAiPrompt = "I'm sorry, I'm a bit stuck. Could you try rephrasing or use manual entry?";
             if (!output.parsingError) { // Avoid overwriting a more specific error
                output.parsingError = "An unexpected issue occurred. Please try again.";
             }
        }
    } else {
        // This case should ideally not happen if the LLM always returns an output matching the schema.
        // However, as a failsafe:
        return {
            parsingError: "The AI didn't provide a response. Please try again.",
            nextAiPrompt: "I'm sorry, there was an issue. Could you please try starting over or use manual entry?"
        };
    }
    
    return output!;
  }
);

