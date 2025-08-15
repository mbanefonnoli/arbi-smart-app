
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomPathBuilder } from "@/components/arbitrage/CustomPathBuilder";
import { Bot, Wrench } from "lucide-react";

interface ArbitrageFormState extends FindArbitrageOpportunitiesInput {
  // extends to include all fields
}

export default function Home() {
  const [arbitrageResult, setArbitrageResult] = useState<FindArbitrageOpportunitiesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentInputs, setCurrentInputs] = useState<ArbitrageFormState | null>(null);
  const { toast } = useToast();

  // State for custom path builder
  const [activeTab, setActiveTab] = useState("ai-optimized");
  const [customPath, setCustomPath] = useState<string[]>([]);

  const handleArbitrageSearch = async (data: Omit<FindArbitrageOpportunitiesInput, 'customPath'>) => {
    setIsLoading(true);
    setError(null);
    setArbitrageResult(null);

    const submissionData: FindArbitrageOpportunitiesInput = {
      ...data,
      platform: data.platform ? data.platform : undefined,
      // Add customPath only if the custom path tab is active and path is not empty
      customPath: activeTab === "custom-path" && customPath.length > 0 ? customPath : undefined,
    };
    setCurrentInputs(submissionData);

    try {
      const result = await getArbitrageOpportunities(submissionData);
      setArbitrageResult(result);
      toast({
        title: "Analysis Complete",
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
              Arbitrage Toolkit
            </h2>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-lg mx-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ai-optimized">
                  <Bot className="mr-2 h-4 w-4" /> AI Optimized
                </TabsTrigger>
                <TabsTrigger value="custom-path">
                  <Wrench className="mr-2 h-4 w-4" /> Custom Path
                </TabsTrigger>
              </TabsList>
              <TabsContent value="ai-optimized">
                 <CurrencyInputForm onSubmit={handleArbitrageSearch} loading={isLoading} mode="ai-optimized" />
              </TabsContent>
              <TabsContent value="custom-path">
                <CurrencyInputForm onSubmit={handleArbitrageSearch} loading={isLoading} mode="custom-path">
                    {(form) => (
                        <div className="mt-6">
                            <CustomPathBuilder 
                                path={customPath}
                                setPath={setCustomPath}
                                sourceCurrency={form.watch('sourceCurrency')}
                                targetCurrency={form.watch('targetCurrency')}
                            />
                        </div>
                    )}
                </CurrencyInputForm>
              </TabsContent>
            </Tabs>
            
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
                  isCustomPath={!!currentInputs.customPath && currentInputs.customPath.length > 0}
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
