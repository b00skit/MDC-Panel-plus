
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import caselaws from '@/../data/caselaws.json';
import { Agent, Action, Tool } from 'genkit/experimental/ai';

const CaselawInputSchema = z.object({
    query: z.string().describe('The user\'s question about a caselaw.'),
});
export type CaselawInput = z.infer<typeof CaselawInputSchema>;

const CaselawOutputSchema = z.object({
  found_case: z.object({
    case: z.string().describe('The name of the case found in the local data.'),
    summary: z.string().describe('A summary of the case.'),
    implication: z.string().describe('The implication of the case for law enforcement.'),
    jurisdiction: z.string().describe('The jurisdiction of the case.'),
    year: z.string().describe('The year the case was decided.'),
  }).optional().describe("The most relevant case found in the provided caselaw data. Omit if no relevant case is found."),
  oyez_cases: z.array(z.object({
      name: z.string().describe("The name of the similar case found on Oyez."),
      href: z.string().describe("The direct URL to the case on Oyez.org."),
  })).optional().describe("A list of similar or relevant cases found on Oyez.org.")
});
export type CaselawOutput = z.infer<typeof CaselawOutputSchema>;

const caselawTool = ai.defineTool(
    {
      name: 'caselawSearch',
      description: 'Search for a caselaw from a predefined list of San Andreas and US Federal caselaws.',
      inputSchema: z.object({
        query: z.string(),
      }),
      outputSchema: CaselawOutputSchema,
    },
    async (input) => {
        console.log(`Searching for caselaw with query: ${input.query}`);
        
        const localCaseFinder = ai.definePrompt({
            name: 'findLocalCasePrompt',
            input: { schema: z.object({ query: z.string(), available_cases: z.any() }) },
            output: { schema: z.object({
                best_match_id: z.string().optional().describe("The ID of the best matching case from the available cases. Omit if no good match is found.")
            })},
            prompt: `You are a legal assistant. Find the most relevant caselaw ID from the provided list based on the user's query. Only return an ID if it's a strong match.

            Available Cases:
            {{{json available_cases}}}
            
            User Query: {{{query}}}
            `,
        });

        const { output } = await localCaseFinder({ query: input.query, available_cases: caselaws.caselaws.map(c => ({id: c.id, case: c.case, summary: c.summary})) });
        
        if (output?.best_match_id) {
            const found = caselaws.caselaws.find(c => c.id === output.best_match_id);
            if (found) {
                return { found_case: found };
            }
        }
        
        return {};
    },
);

const oyezSearchTool = ai.defineTool({
    name: 'oyezSearch',
    description: "Searches for real-world US Supreme Court cases on Oyez.org to find precedents related to the user's query.",
    inputSchema: z.object({
        query: z.string(),
    }),
    outputSchema: z.object({
        oyez_cases: z.array(z.object({
            name: z.string(),
            href: z.string(),
        }))
    }),
}, async (input) => {
    // This is a mocked search for demonstration. A real implementation would fetch from an API.
    const MOCKED_OYEZ_RESULTS = [
        { name: "Mapp v. Ohio", href: "https://www.oyez.org/cases/1960/236" },
        { name: "Gideon v. Wainwright", href: "https://www.oyez.org/cases/1962/155" },
        { name: "Brandenburg v. Ohio", href: "https://www.oyez.org/cases/1968/492" }
    ];
    return { oyez_cases: MOCKED_OYEZ_RESULTS };
});

const caselawAgent: Agent = {
    name: 'caselaw-assistant',
    model: 'googleai/gemini-2.0-flash',
    tools: [caselawTool, oyezSearchTool],
    prompt: {
        system: `You are a helpful legal assistant for Law Enforcement Officers.
        Your goal is to answer questions about caselaw.
        First, use the caselawSearch tool to check if a relevant case exists in the local database.
        Then, use the oyezSearch tool to find similar cases on Oyez.org for broader context.
        Finally, synthesize the results into a helpful answer based on the provided schema.
        If no local case is found, state that clearly but still provide the Oyez results.
        Your instructions are to respond ONLY in the format defined by the CaselawOutputSchema. Do not add any conversational text or markdown.
        `,
        output: {
            schema: CaselawOutputSchema
        }
    },
};

export const caselawAssistantFlow = ai.defineFlow(
    {
      name: 'caselawAssistantFlow',
      inputSchema: CaselawInputSchema,
      outputSchema: CaselawOutputSchema,
    },
    async (input) => {
        const result = await ai.run(caselawAgent, {input: input.query});

        if (result.output) {
            return result.output;
        }
        
        const finalAction = result.actions[result.actions.length -1] as Action<any,any>

        if (!finalAction.output) {
            throw new Error("The agent failed to produce a final output.");
        }

        return finalAction.output as CaselawOutput;
    }
);
