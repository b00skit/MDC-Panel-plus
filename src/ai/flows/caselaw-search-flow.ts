
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import caselaws from '@/../data/caselaws.json';
import { sanitizeLocations } from '@/lib/sanitize-locations';

export const CaselawSearchOutputSchema = z.object({
  found_case: z
    .object({
      case: z.string(),
      summary: z.string(),
      implication: z.string(),
      jurisdiction: z.string(),
      year: z.string(),
      id: z.string(),
      source: z.string().optional(),
    })
    .optional()
    .nullable()
    .describe('The most relevant case found in the local caselaw data.'),
});
export type CaselawSearchOutput = z.infer<typeof CaselawSearchOutputSchema>;

export const OyezSearchOutputSchema = z.object({
  oyez_cases: z.array(
    z.object({
      name: z.string(),
      href: z.string(),
    })
  ).describe("A list of similar or relevant cases found on Oyez.org."),
});
export type OyezSearchOutput = z.infer<typeof OyezSearchOutputSchema>;


export const caselawSearchTool = ai.defineTool(
    {
      name: 'caselawSearchTool',
      description: 'Search for a caselaw from a predefined list of San Andreas and US Federal caselaws.',
      inputSchema: z.object({
        query: z.string().describe("The user's query to search for relevant caselaw."),
      }),
      outputSchema: CaselawSearchOutputSchema,
    },
    async ({query}) => {
        // This is a simplified local search.
        // A real implementation might use a vector DB or more sophisticated search.
        const lowerCaseQuery = query.toLowerCase();
        let bestMatch = null;
        let highestScore = 0;

        for (const law of caselaws.caselaws) {
            let score = 0;
            const content = `${law.case} ${law.summary} ${law.implication}`.toLowerCase();
            if (content.includes(lowerCaseQuery)) {
                score += 10;
            }
            if (law.case.toLowerCase().includes(lowerCaseQuery)) {
                score += 5;
            }
            // Add more scoring logic as needed
            if (score > highestScore) {
                highestScore = score;
                bestMatch = law;
            }
        }
        
        return { found_case: bestMatch ? sanitizeLocations(bestMatch) : null };
    },
);

export const oyezSearchTool = ai.defineTool({
    name: 'oyezSearch',
    description: "Searches for real-world US Supreme Court cases on Oyez.org to find precedents related to the user's query.",
    inputSchema: z.object({
        query: z.string(),
    }),
    outputSchema: OyezSearchOutputSchema,
}, async (input) => {
    // This is a mocked search for demonstration. A real implementation would fetch from an API.
    const MOCKED_OYEZ_RESULTS = [
        { name: "Mapp v. Ohio", href: "https://www.oyez.org/cases/1960/236" },
        { name: "Gideon v. Wainwright", href: "https://www.oyez.org/cases/1962/155" },
        { name: "Brandenburg v. Ohio", href: "https://www.oyez.org/cases/1968/492" }
    ];

    const processedResults = sanitizeLocations(MOCKED_OYEZ_RESULTS);

    return { oyez_cases: processedResults };
});
