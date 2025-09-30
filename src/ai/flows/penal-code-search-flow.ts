
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import config from '@/../data/config.json';
import { sanitizeLocations } from '@/lib/sanitize-locations';

export const PenalCodeSearchOutputSchema = z.object({
  relevant_charges: z
    .array(
      z.object({
        id: z.string().describe("The ID of the charge, e.g., '101'."),
        name: z
          .string()
          .describe("The name of the charge, e.g., 'First-Degree Murder'."),
        type: z
          .enum(['F', 'M', 'I'])
          .describe(
            'The type of the charge: F (Felony), M (Misdemeanor), or I (Infraction).'
          ),
        definition: z.string().describe('The legal definition of the charge.'),
      })
    )
    .describe(
      'An array of the most relevant charges found in the penal code data.'
    ),
});
export type PenalCodeSearchOutput = z.infer<typeof PenalCodeSearchOutputSchema>;

export const penalCodeSearchTool = ai.defineTool(
  {
    name: 'penalCodeSearchTool',
    description: 'Searches the San Andreas Penal Code for relevant criminal charges based on a query.',
    inputSchema: z.object({
      query: z.string().describe("The user's query to search for criminal charges."),
    }),
    outputSchema: PenalCodeSearchOutputSchema,
  },
  async ({ query }) => {
    const penalCodeRes = await fetch(
      `${config.CONTENT_DELIVERY_NETWORK}?file=gtaw_penal_code.json`
    );
    if (!penalCodeRes.ok) {
      throw new Error('Failed to fetch penal code data');
    }
    const penalCodeData = await penalCodeRes.json();

    const lowerCaseQuery = query.toLowerCase();
    const results = Object.values(penalCodeData)
      .map((charge: any) => {
        let score = 0;
        const content = `${charge.charge} ${charge.definition} ${charge.extra || ''}`.toLowerCase();
        if(content.includes(lowerCaseQuery)) score += 10;
        if(charge.charge.toLowerCase().includes(lowerCaseQuery)) score += 5;
        // Simple keyword matching for scoring
        lowerCaseQuery.split(' ').forEach(word => {
            if(content.includes(word)) score++;
        });
        return { ...charge, score };
      })
      .filter((charge) => charge.score > 0 && charge.type !== '?')
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ id, charge, type, definition }) => ({
        id,
        name: charge,
        type,
        definition,
      }));

    return { relevant_charges: sanitizeLocations(results) };
  }
);
