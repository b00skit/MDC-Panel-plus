
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { caselawSearchTool, oyezSearchTool, CaselawSearchOutputSchema, OyezSearchOutputSchema } from './caselaw-search-flow';
import { sanitizeLocations } from '@/lib/sanitize-locations';

const CaselawAssistantInputSchema = z.object({
  query: z.string().describe("The user's question about a caselaw."),
});
export type CaselawAssistantInput = z.infer<typeof CaselawAssistantInputSchema>;

const CaselawAssistantOutputSchema = z.object({
  found_case: CaselawSearchOutputSchema.shape.found_case.optional(),
  oyez_cases: OyezSearchOutputSchema.shape.oyez_cases.optional(),
});
export type CaselawAssistantOutput = z.infer<typeof CaselawAssistantOutputSchema>;


const caselawAssistantPrompt = ai.definePrompt({
    name: "caselawAssistantPrompt",
    tools: [caselawSearchTool, oyezSearchTool],
    prompt: `You are a helpful legal assistant for Law Enforcement Officers.
    Your goal is to answer questions about caselaw based on the user's query.
    
    Use the provided tools to search for relevant caselaw.
    - Use 'caselawSearchTool' to find the single most relevant case from the local San Andreas database.
    - Use 'oyezSearchTool' to find similar real-world cases on Oyez.org for broader context.

    Your instructions are to respond ONLY in the format defined by the output schema, using the data from the tools. Do not add any conversational text or markdown.
    
    User Query: {{query}}`,
    output: {
        schema: CaselawAssistantOutputSchema
    }
});

async function logToDiscord(query: string, result: CaselawAssistantOutput) {
    const webhookUrl = process.env.DISCORD_LOGS_WEBHOOK_URL;
    if (!webhookUrl) return;

    let resultDescription = '';
    if (result.found_case) {
        resultDescription += `**Local Case Found:** ${result.found_case.case}\n`;
    } else {
        resultDescription += `**Local Case Found:** None\n`;
    }

    if (result.oyez_cases && result.oyez_cases.length > 0) {
        resultDescription += `**Oyez Cases:**\n` + result.oyez_cases.map(c => `- ${c.name}`).join('\n');
    }

    const embed = {
        title: '⚖️ Caselaw AI Search',
        color: 5814783,
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


export async function caselawAssistantFlow(input: CaselawAssistantInput): Promise<CaselawAssistantOutput> {
    const result = await caselawAssistantPrompt(input);
    const output = result.output;
    if (!output) {
        throw new Error("The AI failed to produce a valid output.");
    }
    
    await logToDiscord(input.query, output);

    const sanitized = sanitizeLocations(output) as CaselawAssistantOutput;
    return sanitized;
}
