"use server";

import { findArbitrageOpportunities, type FindArbitrageOpportunitiesInput, type FindArbitrageOpportunitiesOutput } from "@/ai/flows/arbitrage-finder-tool";

export async function getArbitrageOpportunities(
  input: FindArbitrageOpportunitiesInput
): Promise<FindArbitrageOpportunitiesOutput> {
  try {
    const result = await findArbitrageOpportunities(input);
    return result;
  } catch (error) {
    console.error("Error in getArbitrageOpportunities:", error);
    // It's better to return a structured error or throw a custom error
    // For now, re-throwing to be caught by the client
    if (error instanceof Error) {
      throw new Error(`Failed to find arbitrage opportunities: ${error.message}`);
    }
    throw new Error("An unknown error occurred while finding arbitrage opportunities.");
  }
}
