
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import caselaws from '@/../data/caselaws.json';
import { Action, Tool } from 'genkit/experimental/ai';
import { sanitizeLocations } from '@/lib/sanitize-locations';

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
  }).optional().nullable().describe("The most relevant case found in the provided caselaw data. Omit or set to null if no relevant case is found."),
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
      outputSchema: z.object({ 
        found_case: z.object({
            case: z.string(),
            summary: z.string(),
            implication: z.string(),
            jurisdiction: z.string(),
            year: z.string(),
            id: z.string(),
            source: z.string().optional()
          }).optional().nullable(),
      }),
    },
    async () => {
        // This tool now just acts as a data provider. The filtering will happen in the prompt.
        return { found_case: null }; // Returning null as we are not performing search here anymore.
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

    const processedResults = sanitizeLocations(MOCKED_OYEZ_RESULTS);

    return { oyez_cases: processedResults };
});

const caselawAssistantPrompt = ai.definePrompt({
    name: "caselawAssistantPrompt",
    tools: [oyezSearchTool],
    prompt: `You are a helpful legal assistant for Law Enforcement Officers.
    Your goal is to answer questions about caselaw based on the user's query.
    
    First, analyze the user's query and compare it against the provided list of local caselaws. Find the single most relevant case from this list. A case is relevant if its summary or implication directly addresses the user's question. If you find a strong match, populate the 'found_case' field in your response. If no local case is a strong match, leave the 'found_case' field as null.

    Then, use the oyezSearch tool to find similar cases on Oyez.org for broader context.
    Finally, synthesize the results into a helpful answer based on the provided schema.
    Your instructions are to respond ONLY in the format defined by the CaselawOutputSchema. Do not add any conversational text or markdown.

    LOCAL CASELOWS:
    {{{json localCaselaws}}}
    
    User Query: {{query}}`,
    output: {
        schema: CaselawOutputSchema
    }
});

async function logToDiscord(query: string, result: CaselawOutput) {
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


export const caselawAssistantFlow = ai.defineFlow(
    {
      name: 'caselawAssistantFlow',
      inputSchema: CaselawInputSchema,
      outputSchema: CaselawOutputSchema,
    },
    async (input) => {
        const result = await caselawAssistantPrompt({ 
            query: input.query,
            localCaselaws: caselaws.caselaws
        });
        const output = result.output;
        if (!output) {
            throw new Error("The AI failed to produce a valid output.");
        }
        
        await logToDiscord(input.query, output);

        const sanitized = sanitizeLocations(output) as CaselawOutput;
        return sanitized;
    }
);
