
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import config from '@/../data/config.json';
import { sanitizeLocations } from '@/lib/sanitize-locations';

const PenalCodeInputSchema = z.object({
    query: z.string().describe("The user's question about a criminal charge."),
});
export type PenalCodeInput = z.infer<typeof PenalCodeInputSchema>;

const PenalCodeOutputSchema = z.object({
  relevant_charges: z.array(z.object({
    id: z.string().describe("The ID of the charge, e.g., '101'."),
    name: z.string().describe("The name of the charge, e.g., 'First-Degree Murder'."),
    type: z.enum(['F', 'M', 'I']).describe("The type of the charge: F (Felony), M (Misdemeanor), or I (Infraction)."),
    definition: z.string().describe("The legal definition of the charge."),
  })).describe("An array of the most relevant charges found in the provided penal code data. Return up to 5 of the most relevant charges. Do not return charges that are not relevant.")
});
export type PenalCodeOutput = z.infer<typeof PenalCodeOutputSchema>;


const penalCodeAssistantPrompt = ai.definePrompt({
    name: "penalCodeAssistantPrompt",
    prompt: `You are a helpful legal assistant for Law Enforcement Officers.
    Your goal is to answer questions about criminal charges by searching the provided San Andreas Penal Code.
    
    Analyze the user's query and find the most relevant charges from the provided JSON data.
    A charge is relevant if its name or definition directly addresses the user's situation.
    Return up to 5 of the most relevant charges. If no relevant charges are found, return an empty array.

    Your instructions are to respond ONLY in the format defined by the PenalCodeOutputSchema. Do not add any conversational text or markdown.

    PENAL CODE:
    {{{json penalCode}}}
    
    User Query: {{query}}`,
    output: {
        schema: PenalCodeOutputSchema
    }
});

async function logToDiscord(query: string, result: PenalCodeOutput) {
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


export const penalCodeAssistantFlow = ai.defineFlow(
    {
      name: 'penalCodeAssistantFlow',
      inputSchema: PenalCodeInputSchema,
      outputSchema: PenalCodeOutputSchema,
    },
    async (input) => {
        const penalCodeRes = await fetch(`${config.CONTENT_DELIVERY_NETWORK}?file=gtaw_penal_code.json`);
        if (!penalCodeRes.ok) {
            throw new Error('Failed to fetch penal code data');
        }
        const penalCodeData = await penalCodeRes.json();

        const result = await penalCodeAssistantPrompt({ 
            query: input.query,
            penalCode: penalCodeData
        });
        const output = result.output;
        if (!output) {
            throw new Error("The AI failed to produce a valid output.");
        }
        
        await logToDiscord(input.query, output);

        const sanitized = sanitizeLocations(output) as PenalCodeOutput;
        return sanitized;
    }
);
