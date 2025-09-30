
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { penalCodeSearchTool, PenalCodeSearchOutputSchema } from './penal-code-search-flow';
import { sanitizeLocations } from '@/lib/sanitize-locations';

const PenalCodeAssistantInputSchema = z.object({
  query: z.string().describe("The user's question about a criminal charge."),
});
export type PenalCodeAssistantInput = z.infer<typeof PenalCodeAssistantInputSchema>;

const penalCodeAssistantPrompt = ai.definePrompt({
  name: 'penalCodeAssistantPrompt',
  tools: [penalCodeSearchTool],
  prompt: `You are a helpful legal assistant for Law Enforcement Officers.
    Your goal is to answer questions about criminal charges by searching the provided San Andreas Penal Code.
    
    Use the 'penalCodeSearchTool' to find the most relevant charges from the penal code data based on the user's query.
    Return up to 5 of the most relevant charges. If no relevant charges are found, return an empty array.

    Your instructions are to respond ONLY in the format defined by the output schema. Do not add any conversational text or markdown.
    
    User Query: {{query}}`,
  output: {
    schema: PenalCodeSearchOutputSchema,
  },
});

async function logToDiscord(query: string, result: PenalCodeSearchOutput) {
    const webhookUrl = process.env.DISCORD_LOGS_WEBHOOK_URL;
    if (!webhookUrl) return;

    let resultDescription = '';
    if (result.relevant_charges.length > 0) {
        resultDescription = result.relevant_charges.map(c => `- **${c.id} ${c.name}**: ${c.definition.substring(0, 100)}...`).join('\n');
    } else {
        resultDescription = 'No relevant charges found.';
    }

    const embed = {
        title: '📜 Penal Code AI Search',
        color: 16750848, // Orange
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


export async function penalCodeAssistantFlow(input: PenalCodeAssistantInput): Promise<PenalCodeSearchOutput> {
    const result = await penalCodeAssistantPrompt(input);
    const output = result.output;
    if (!output) {
        throw new Error("The AI failed to produce a valid output.");
    }
    
    await logToDiscord(input.query, output);

    const sanitized = sanitizeLocations(output) as PenalCodeSearchOutput;
    return sanitized;
}
