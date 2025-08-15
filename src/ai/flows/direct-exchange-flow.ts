'use server';
/**
 * @fileOverview A direct currency exchange AI agent.
 *
 * - getDirectExchange - A function that handles the direct currency exchange process.
 * - DirectExchangeInput - The input type for the getDirectExchange function.
 * - DirectExchangeOutput - The return type for the getDirectExchange function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DirectExchangeInputSchema = z.object({
  sourceCurrency: z.string().describe('The source currency code (e.g., USD).'),
  targetCurrency: z.string().describe('The target currency code (e.g., EUR).'),
  amount: z.number().describe('The amount to convert in the source currency.'),
});
export type DirectExchangeInput = z.infer<typeof DirectExchangeInputSchema>;

const DirectExchangeOutputSchema = z.object({
  convertedAmount: z.number().describe('The converted amount in the target currency.'),
  exchangeRate: z.number().describe('The exchange rate used for the conversion (from source to target).'),
});
export type DirectExchangeOutput = z.infer<typeof DirectExchangeOutputSchema>;

export async function getDirectExchange(input: DirectExchangeInput): Promise<DirectExchangeOutput> {
  return directExchangeFlow(input);
}

const exchangePrompt = ai.definePrompt({
  name: 'directExchangePrompt',
  input: {schema: DirectExchangeInputSchema},
  output: {schema: DirectExchangeOutputSchema},
  prompt: `You are a simple and direct currency exchange rate provider.
Given a source currency, target currency, and an amount, provide a plausible, realistic, real-time exchange rate and the resulting converted amount.

Input:
- Source Currency: {{{sourceCurrency}}}
- Target Currency: {{{targetCurrency}}}
- Amount: {{{amount}}}

Output the following in JSON format adhering to the defined schema:
- convertedAmount: The final amount in {{{targetCurrency}}} after direct conversion.
- exchangeRate: The exchange rate used to convert 1 unit of {{{sourceCurrency}}} to {{{targetCurrency}}}.

For example, if the input is 100 USD to EUR, and the current rate is 1 USD = 0.92 EUR, the output should be:
- convertedAmount: 92.00
- exchangeRate: 0.92

Please provide a realistic-sounding exchange rate. Ensure all outputs are numeric.
`,
});

const directExchangeFlow = ai.defineFlow(
  {
    name: 'directExchangeFlow',
    inputSchema: DirectExchangeInputSchema,
    outputSchema: DirectExchangeOutputSchema,
  },
  async (input) => {
    const {output} = await exchangePrompt(input);
    if (!output) {
        throw new Error('The AI model did not return a valid output. Please try again.');
    }
    return output;
  }
);
