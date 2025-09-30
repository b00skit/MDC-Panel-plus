
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { caselawSearchTool, CaselawSearchOutputSchema, oyezSearchTool, OyezSearchOutputSchema } from './caselaw-search-flow';
import { penalCodeSearchTool, PenalCodeSearchOutputSchema } from './penal-code-search-flow';
import { sanitizeLocations } from '@/lib/sanitize-locations';

const LegalAssistantInputSchema = z.object({
  query: z.string().describe("The user's question about a legal situation, potentially involving criminal charges or caselaw."),
});
export type LegalAssistantInput = z.infer<typeof LegalAssistantInputSchema>;

const LegalAssistantOutputSchema = z.object({
  explanation: z.string().optional().describe("A brief, clear explanation of the legal concepts relevant to the user's query."),
  relevant_charges: PenalCodeSearchOutputSchema.shape.relevant_charges.optional(),
  found_case: CaselawSearchOutputSchema.shape.found_case.optional(),
  oyez_cases: OyezSearchOutputSchema.shape.oyez_cases.optional(),
});
export type LegalAssistantOutput = z.infer<typeof LegalAssistantOutputSchema>;

const legalAssistantPrompt = ai.definePrompt({
  name: 'legalAssistantPrompt',
  tools: [penalCodeSearchTool, caselawSearchTool, oyezSearchTool],
  prompt: `You are an expert legal assistant for law enforcement officers in San Andreas.
Your task is to provide a clear, concise, and helpful response to the user's query by using the provided tools to search the penal code and caselaw databases.

1.  **Analyze the Query**: Understand if the user is asking about a specific crime, a legal procedure, or a scenario that might involve both.
2.  **Use Tools**:
    *   If the query seems related to a crime, use the \`penalCodeSearchTool\` to find relevant statutes.
    *   If the query is about legal precedents, rights, or police procedures (like searches, arrests, use of force), use the \`caselawSearchTool\` to find relevant local caselaw.
    *   Also, use the \`oyezSearchTool\` to find related real-world U.S. Supreme Court cases for broader context.
3.  **Synthesize and Explain**: Based on the tool results, generate a helpful \`explanation\` that answers the user's question directly.
4.  **Format Output**: Populate the response strictly according to the \`LegalAssistantOutputSchema\`. Include the explanation and any relevant data returned by the tools.`,
    output: {
        schema: LegalAssistantOutputSchema,
    },
});

async function logToDiscord(query: string, result: LegalAssistantOutput) {
    const webhookUrl = process.env.DISCORD_LOGS_WEBHOOK_URL;
    if (!webhookUrl) return;

    let resultDescription = `**Explanation:**\n${result.explanation || 'None'}\n\n`;

    if (result.relevant_charges && result.relevant_charges.length > 0) {
        resultDescription += `**Charges Found:** ${result.relevant_charges.map(c => c.name).join(', ')}\n`;
    }
    if (result.found_case) {
        resultDescription += `**Local Case Found:** ${result.found_case.case}\n`;
    }

    const embed = {
        title: '🔍 AI Legal Search',
        color: 0x8e44ad,
        fields: [
            {
                name: 'User Query',
                value: `\`\`\`${query}\`\`\``,
            },
            {
                name: 'AI Result',
                value: resultDescription,
            }
        ],
        timestamp: new Date().toISOString(),
    };

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] }),
        });
    } catch (e) {
        console.error("Failed to log to Discord:", e);
    }
}

export const legalAssistantFlow = ai.defineFlow(
  {
    name: 'legalAssistantFlow',
    inputSchema: LegalAssistantInputSchema,
    outputSchema: LegalAssistantOutputSchema,
  },
  async (input) => {
    const result = await legalAssistantPrompt(input);
    const output = result.output;
    if (!output) {
      throw new Error("The AI failed to produce a valid output.");
    }
    
    await logToDiscord(input.query, output);

    const sanitized = sanitizeLocations(output) as LegalAssistantOutput;
    return sanitized;
  }
);
