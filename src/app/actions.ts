"use server";

import { findArbitrageOpportunities, type FindArbitrageOpportunitiesInput, type FindArbitrageOpportunitiesOutput } from "@/ai/flows/arbitrage-finder-tool";
import { getDirectExchange as getDirectExchangeFlow, type DirectExchangeInput, type DirectExchangeOutput } from "@/ai/flows/direct-exchange-flow";

export async function getArbitrageOpportunities(
  input: FindArbitrageOpportunitiesInput
): Promise<FindArbitrageOpportunitiesOutput> {
  try {
    const result = await findArbitrageOpportunities(input);
    return result;
  } catch (error) {
    console.error("Error in getArbitrageOpportunities:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to find arbitrage opportunities: ${error.message}`);
    }
    throw new Error("An unknown error occurred while finding arbitrage opportunities.");
  }
}

export async function getDirectExchange(
  input: DirectExchangeInput
): Promise<DirectExchangeOutput> {
  try {
    const result = await getDirectExchangeFlow(input);
    return result;
  } catch (error) {
    console.error("Error in getDirectExchange:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to get direct exchange rate: ${error.message}`);
    }
    throw new Error("An unknown error occurred while getting the exchange rate.");
  }
}
