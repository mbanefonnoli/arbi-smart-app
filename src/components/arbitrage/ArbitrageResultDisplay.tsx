
"use client";

import * as React from "react";
import type { FindArbitrageOpportunitiesOutput } from "@/ai/flows/arbitrage-finder-tool";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, TrendingDown, TrendingUp, Repeat, BuildingIcon } from "lucide-react";

interface ArbitrageResultDisplayProps {
  result: FindArbitrageOpportunitiesOutput;
  sourceCurrency: string;
  targetCurrency: string;
  amount: number;
  platform?: string; // Make platform optional
}

export function ArbitrageResultDisplay({ result, sourceCurrency, targetCurrency, amount, platform }: ArbitrageResultDisplayProps) {
  const { arbitragePath, finalAmount, directConversionAmount, profit } = result;

  const formatCurrency = (value: number, currencyCode: string) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(value);
    } catch (e) {
      // Fallback for unknown currency codes
      return `${value.toFixed(4)} ${currencyCode}`;
    }
  };
  
  const profitIsPositive = profit > 0;
  const profitIsNegative = profit < 0;

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center text-primary">Arbitrage Result</CardTitle>
        <CardDescription className="text-center">
          From {formatCurrency(amount, sourceCurrency)} to {targetCurrency}
          {platform && platform !== "" && (
            <span className="block text-sm mt-1">
              Considering platform: <span className="font-semibold">{platform}</span>
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 font-headline flex items-center">
            <Repeat className="mr-2 h-5 w-5 text-primary" />
            Optimal Conversion Path
          </h3>
          <div className="flex flex-wrap items-center gap-2 bg-secondary p-3 rounded-md">
            {arbitragePath.map((currency, index) => (
              <React.Fragment key={currency}>
                <span className={`font-medium ${index === 0 || index === arbitragePath.length -1 ? 'text-primary' : ''}`}>{currency}</span>
                {index < arbitragePath.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle className="text-xl font-headline">Direct Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-medium">
                {formatCurrency(directConversionAmount, targetCurrency)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary/10 border-primary">
            <CardHeader>
              <CardTitle className="text-xl font-headline text-primary">Arbitrage Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-medium text-primary">
                {formatCurrency(finalAmount, targetCurrency)}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-2 font-headline flex items-center">
            {profitIsPositive && <TrendingUp className="mr-2 h-5 w-5 text-accent" />}
            {profitIsNegative && <TrendingDown className="mr-2 h-5 w-5 text-destructive" />}
            {!profitIsPositive && !profitIsNegative && <ArrowRight className="mr-2 h-5 w-5 text-muted-foreground" />}
            Potential Profit
          </h3>
          <p 
            className={`text-3xl font-bold ${
              profitIsPositive ? 'text-accent' : profitIsNegative ? 'text-destructive' : 'text-foreground'
            }`}
          >
            {formatCurrency(profit, targetCurrency)}
          </p>
          {profit === 0 && <p className="text-sm text-muted-foreground mt-1">No significant arbitrage opportunity found with this path.</p>}
        </div>

      </CardContent>
    </Card>
  );
}
