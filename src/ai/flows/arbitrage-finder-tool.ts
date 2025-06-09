
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
});
export type FindArbitrageOpportunitiesInput = z.infer<typeof FindArbitrageOpportunitiesInputSchema>;

const FindArbitrageOpportunitiesOutputSchema = z.object({
  arbitragePath: z
    .array(z.string())
    .describe(
      'An array of currency codes representing the optimal conversion path for arbitrage (e.g., ["USD", "CAD", "EUR"]).'
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
Given a source currency, target currency, an amount, and optionally a preferred financial platform, find the optimal arbitrage path using hypothetical real-time exchange rates.

Input:
- Source Currency: {{{sourceCurrency}}}
- Target Currency: {{{targetCurrency}}}
- Amount: {{{amount}}}
{{#if platform}}- Preferred Platform: {{{platform}}}{{/if}}

Output the following in JSON format adhering to the defined schema:
- arbitragePath: An array of currency codes representing the optimal conversion path (e.g., ["{{{sourceCurrency}}}", "XYZ", "{{{targetCurrency}}}"]). This path might involve one or more intermediate currencies if it offers a better rate than direct conversion.
- finalAmount: The final amount in {{{targetCurrency}}} after executing all conversions in the arbitragePath.
- directConversionAmount: The amount in {{{targetCurrency}}} if {{{amount}}} {{{sourceCurrency}}} is converted directly to {{{targetCurrency}}}.
- profit: The difference (finalAmount - directConversionAmount) in {{{targetCurrency}}}.
- warnings: An optional array of strings detailing any potential risks, high fees, or volatility associated with the identified path or currencies. If no specific warnings, this field can be omitted or an empty array should be provided.

Analyze the potential for arbitrage. For this simulation, you can invent plausible exchange rates if necessary to demonstrate an arbitrage opportunity or lack thereof.
If a platform is specified (e.g., Wise, Revolut), consider that it might offer slightly different rates or have specific fees, and you can reflect this in your simulated outcome or warnings. If "Any Platform" or no platform is specified, assume general market conditions.

For example, if direct USD to EUR is 100 USD = 90 EUR.
An arbitrage path like USD -> GBP -> EUR might yield 100 USD = 92 EUR.
In this case, profit would be 2 EUR.
The arbitragePath would be ["USD", "GBP", "EUR"].
finalAmount would be 92.
directConversionAmount would be 90.

Please provide a realistic-sounding scenario. Ensure amounts are numeric.
If no profitable arbitrage opportunity is found, the profit can be zero or negative, and the arbitragePath can be the same as the direct path (e.g., ["{{{sourceCurrency}}}", "{{{targetCurrency}}}"]).
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
