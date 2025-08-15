
"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CurrencyInputForm } from "@/components/arbitrage/CurrencyInputForm";
import { ArbitrageResultDisplay } from "@/components/arbitrage/ArbitrageResultDisplay";
import { RiskAssessmentDisplay } from "@/components/arbitrage/RiskAssessmentDisplay";
import { DirectExchange } from "@/components/exchange/DirectExchange";
import { HistoricalDataCharts } from "@/components/charts/HistoricalDataCharts";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getArbitrageOpportunities } from "./actions";
import type { FindArbitrageOpportunitiesInput, FindArbitrageOpportunitiesOutput } from "@/ai/flows/arbitrage-finder-tool";

interface ArbitrageFormState extends FindArbitrageOpportunitiesInput {
  // platform is already part of FindArbitrageOpportunitiesInput and optional
}

export default function Home() {
  const [arbitrageResult, setArbitrageResult] = useState<FindArbitrageOpportunitiesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentInputs, setCurrentInputs] = useState<ArbitrageFormState | null>(null);
  const { toast } = useToast();

  const handleArbitrageSearch = async (data: FindArbitrageOpportunitiesInput) => {
    setIsLoading(true);
    setError(null);
    setArbitrageResult(null);
    setCurrentInputs(data); // data already includes the optional platform

    try {
      // Ensure platform is handled correctly (it might be undefined if "Any Platform" was selected)
      const submissionData: FindArbitrageOpportunitiesInput = {
        ...data,
        platform: data.platform ? data.platform : undefined,
      };
      const result = await getArbitrageOpportunities(submissionData);
      setArbitrageResult(result);
      toast({
        title: "Arbitrage Search Complete",
        description: "Results are now displayed.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <section id="direct-exchange" className="scroll-mt-20">
            <h2 className="text-3xl md:text-4xl font-headline mb-8 text-center text-primary drop-shadow-sm">
              Direct Exchange
            </h2>
            <DirectExchange />
          </section>

          <section id="arbitrage-tool" className="scroll-mt-20">
            <h2 className="text-3xl md:text-4xl font-headline mb-8 text-center text-primary drop-shadow-sm">
              Find Arbitrage Opportunities
            </h2>
            <CurrencyInputForm onSubmit={handleArbitrageSearch} loading={isLoading} />
            
            {error && (
              <p className="text-destructive text-center mt-6 bg-destructive/10 p-3 rounded-md">
                {error}
              </p>
            )}

            {arbitrageResult && currentInputs && (
              <div className="mt-8">
                <ArbitrageResultDisplay 
                  result={arbitrageResult} 
                  sourceCurrency={currentInputs.sourceCurrency}
                  targetCurrency={currentInputs.targetCurrency}
                  amount={currentInputs.amount}
                  platform={currentInputs.platform}
                />
              </div>
            )}
            
            {arbitrageResult?.warnings && arbitrageResult.warnings.length > 0 && (
              <div className="mt-8">
                <RiskAssessmentDisplay warnings={arbitrageResult.warnings} />
              </div>
            )}
          </section>
        </div>

        <Separator className="my-12 md:my-16" />

        <section id="historical-data" className="scroll-mt-20">
          <h2 className="text-3xl md:text-4xl font-headline mb-8 text-center text-primary drop-shadow-sm">
            Historical Data Analysis
          </h2>
          <HistoricalDataCharts />
        </section>
      </main>
      <Footer />
    </div>
  );
}
