'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import config from '@/../data/config.json';
import caselaws from '@/../data/caselaws.json';
import { sanitizeLocations } from '@/lib/sanitize-locations';

const LegalSearchInputSchema = z.object({
  query: z.string().describe("The user's legal question."),
});
export type LegalSearchInput = z.infer<typeof LegalSearchInputSchema>;

const PenalCodeChargeSchema = z.object({
  id: z.string().describe('The ID of the charge, e.g., "101".'),
  name: z.string().describe('The name of the charge.'),
  type: z.enum(['F', 'M', 'I']).describe('The type of the charge: F (Felony), M (Misdemeanor), or I (Infraction).'),
  definition: z.string().describe('A concise description of the charge.'),
});

const LocalCaselawSchema = z.object({
  case: z.string().describe('The name of the caselaw.'),
  summary: z.string().describe('A summary of the caselaw.'),
  implication: z.string().describe('How the caselaw impacts law enforcement.'),
  jurisdiction: z.string().describe('The jurisdiction of the caselaw.'),
  year: z.string().describe('The year the caselaw was decided.'),
});

const OyezCaseSchema = z.object({
  name: z.string().describe('The name of the relevant US Supreme Court case.'),
  href: z.string().describe('The direct URL to the case on Oyez.org.'),
});

const LegalSearchOutputSchema = z.object({
  explanation: z
    .string()
    .describe('A brief explanation summarising how the cited penal code charges or caselaw relate to the query.'),
  penal_code_results: z
    .array(PenalCodeChargeSchema)
    .describe('Up to five penal code charges that are relevant to the query. Return an empty array if none apply.'),
  caselaw_result: LocalCaselawSchema.optional().nullable().describe('The single most relevant local caselaw if one exists.'),
  oyez_cases: z
    .array(OyezCaseSchema)
    .optional()
    .describe('Optional list of similar US Supreme Court cases from Oyez.org. May be empty.'),
});
export type LegalSearchOutput = z.infer<typeof LegalSearchOutputSchema>;

const oyezSearchTool = ai.defineTool({
  name: 'oyezSearch',
  description:
    "Searches for real-world US Supreme Court cases on Oyez.org to find precedents related to the user's query.",
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.object({
    oyez_cases: z.array(OyezCaseSchema),
  }),
}, async () => {
  const MOCKED_OYEZ_RESULTS = [
    { name: 'Mapp v. Ohio', href: 'https://www.oyez.org/cases/1960/236' },
    { name: 'Gideon v. Wainwright', href: 'https://www.oyez.org/cases/1962/155' },
    { name: 'Brandenburg v. Ohio', href: 'https://www.oyez.org/cases/1968/492' },
  ];

  return { oyez_cases: sanitizeLocations(MOCKED_OYEZ_RESULTS) };
});

const legalSearchPrompt = ai.definePrompt({
  name: 'legalSearchPrompt',
  tools: [oyezSearchTool],
  prompt: `You are a helpful legal assistant for Law Enforcement Officers.
  The user will provide a question related to penal code charges or caselaw.

  1. Review the provided San Andreas Penal Code data to find up to five relevant charges that directly answer the user's query.
  2. Review the provided local caselaw data to determine the single most relevant case, if any.
  3. When the user would benefit from additional precedent, use the oyezSearch tool to surface similar US Supreme Court cases.
  4. Produce a concise explanation that ties together the penal code citations and/or caselaw you found.

  Always respond strictly in JSON that matches the LegalSearchOutputSchema. Do not add markdown or conversational filler.

  SAN ANDREAS PENAL CODE:
  {{{json penalCode}}}

  LOCAL CASELAWS:
  {{{json localCaselaws}}}

  User Query: {{query}}`,
  output: {
    schema: LegalSearchOutputSchema,
  },
});

async function logToDiscord(query: string, result: LegalSearchOutput) {
  const webhookUrl = process.env.DISCORD_LOGS_WEBHOOK_URL;
  if (!webhookUrl) return;

  const fields = [] as { name: string; value: string }[];

  fields.push({
    name: 'Explanation',
    value: result.explanation || 'No explanation provided.',
  });

  if (result.penal_code_results.length > 0) {
    const charges = result.penal_code_results
      .map((charge) => `- **${charge.id} ${charge.name}**`)
      .join('\n');
    fields.push({
      name: 'Penal Code Citations',
      value: charges,
    });
  }

  if (result.caselaw_result) {
    fields.push({
      name: 'Caselaw Citation',
      value: `${result.caselaw_result.case} (${result.caselaw_result.year})`,
    });
  }

  if (result.oyez_cases && result.oyez_cases.length > 0) {
    const oyez = result.oyez_cases.map((c) => `- ${c.name}`).join('\n');
    fields.push({
      name: 'Oyez References',
      value: oyez,
    });
  }

  const embed = {
    title: '🔍 AI Legal Search',
    color: 3447003,
    fields,
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            ...embed,
            fields: [
              {
                name: 'User Query',
                value: `\`\`\`${query}\`\`\``,
              },
              ...fields,
            ],
          },
        ],
      }),
    });
  } catch (error) {
    console.error('Failed to log to Discord:', error);
  }
}

export const legalSearchFlow = ai.defineFlow(
  {
    name: 'legalSearchFlow',
    inputSchema: LegalSearchInputSchema,
    outputSchema: LegalSearchOutputSchema,
  },
  async (input) => {
    const penalCodeRes = await fetch(`${config.CONTENT_DELIVERY_NETWORK}?file=gtaw_penal_code.json`);
    if (!penalCodeRes.ok) {
      throw new Error('Failed to fetch penal code data');
    }
    const penalCodeData = await penalCodeRes.json();

    const result = await legalSearchPrompt({
      query: input.query,
      penalCode: penalCodeData,
      localCaselaws: caselaws.caselaws,
    });

    const output = result.output;
    if (!output) {
      throw new Error('The AI failed to produce a valid output.');
    }

    await logToDiscord(input.query, output);

    return sanitizeLocations(output) as LegalSearchOutput;
  }
);
