
'use server';
/**
 * @fileOverview An arbitrage finder AI agent.
 *
 * - findArbitrageOpportunities - A function that handles the arbitrage finding process.
 * - FindArbitrageOpportunitiesInput - The input type for the findArbitrageOpportunities function.
 * - FindArbitrageOpportunitiesOutput - The return type for the findArbitrageOpportunities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindArbitrageOpportunitiesInputSchema = z.object({
  sourceCurrency: z.string().describe('The source currency code (e.g., USD).'),
  targetCurrency: z.string().describe('The target currency code (e.g., EUR).'),
  amount: z.number().describe('The amount to convert in the source currency.'),
  platform: z.string().optional().describe('The preferred financial platform to consider (e.g., Wise, Revolut). If "Any Platform" or no platform is specified, consider general market rates.'),
  customPath: z.array(z.string()).optional().describe('A user-defined intermediary currency path (e.g., ["CAD", "JPY"]). The full path will be [source, ...customPath, target].'),
});
export type FindArbitrageOpportunitiesInput = z.infer<typeof FindArbitrageOpportunitiesInputSchema>;

const FindArbitrageOpportunitiesOutputSchema = z.object({
  arbitragePath: z
    .array(z.string())
    .describe(
      'An array of currency codes representing the optimal or specified conversion path (e.g., ["USD", "CAD", "EUR"]).'
    ),
  finalAmount: z.number().describe('The final amount after arbitrage conversion in the target currency.'),
  directConversionAmount: z.number().describe('The amount if converted directly to the target currency.'),
  profit: z.number().describe('The potential profit from arbitrage in the target currency.'),
  warnings: z.array(z.string()).optional().describe('An array of warnings or risk factors associated with the arbitrage opportunity (e.g., ["High market volatility", "Liquidity risk for XYZ currency"]). If none, this can be omitted or an empty array.')
});
export type FindArbitrageOpportunitiesOutput = z.infer<typeof FindArbitrageOpportunitiesOutputSchema>;

export async function findArbitrageOpportunities(input: FindArbitrageOpportunitiesInput): Promise<FindArbitrageOpportunitiesOutput> {
  return findArbitrageOpportunitiesFlow(input);
}

const arbitragePrompt = ai.definePrompt({
  name: 'arbitrageFinderPrompt',
  input: {schema: FindArbitrageOpportunitiesInputSchema},
  output: {schema: FindArbitrageOpportunitiesOutputSchema},
  prompt: `You are an expert financial analyst specializing in currency arbitrage.
Given a source currency, target currency, an amount, and other optional parameters, analyze the conversion.
You can invent plausible, realistic real-time exchange rates to perform the calculation.

Input:
- Source Currency: {{{sourceCurrency}}}
- Target Currency: {{{targetCurrency}}}
- Amount: {{{amount}}}
{{#if platform}}- Preferred Platform: {{{platform}}}{{/if}}
{{#if customPath}}- User-Defined Path: {{{sourceCurrency}}} -> {{#each customPath}}{{{this}}} -> {{/each}}{{{targetCurrency}}}{{/if}}

Your task is to:
{{#if customPath}}
1.  **Calculate the outcome of the user-defined path**. The full path to use is [{{{sourceCurrency}}}, {{#each customPath}}"{{{this}}}", {{/each}}"{{{targetCurrency}}}"].
2.  Simulate the conversion through each currency in the specified order.
3.  Set 'arbitragePath' in the output to the exact user-defined path you evaluated.
{{else}}
1.  **Find the optimal arbitrage path**. This might involve one or more intermediate currencies if it offers a better rate than direct conversion.
2.  Set 'arbitragePath' in the output to the optimal path you discover (e.g., ["{{{sourceCurrency}}}", "XYZ", "{{{targetCurrency}}}"]).
{{/if}}

For both cases, output the following in JSON format adhering to the defined schema:
- arbitragePath: The conversion path used for the calculation.
- finalAmount: The final amount in {{{targetCurrency}}} after executing all conversions in the path.
- directConversionAmount: The amount in {{{targetCurrency}}} if {{{amount}}} {{{sourceCurrency}}} was converted directly.
- profit: The difference (finalAmount - directConversionAmount) in {{{targetCurrency}}}.
- warnings: An optional array of strings detailing any potential risks (e.g., high fees, volatility, liquidity issues) associated with the path. If none, omit or provide an empty array.

If no profitable arbitrage opportunity is found, the profit can be zero or negative.
Ensure amounts are numeric and the scenario is realistic.
`,
});

const findArbitrageOpportunitiesFlow = ai.defineFlow(
  {
    name: 'findArbitrageOpportunitiesFlow',
    inputSchema: FindArbitrageOpportunitiesInputSchema,
    outputSchema: FindArbitrageOpportunitiesOutputSchema,
  },
  async (input) => {
    const {output} = await arbitragePrompt(input);
    if (!output) {
        throw new Error('The AI model did not return a valid output. Please try again.');
    }
    // Ensure warnings is an array if it's undefined, as per schema optionality and page.tsx usage
    return {
        ...output,
        warnings: output.warnings ?? [],
    };
  }
);
