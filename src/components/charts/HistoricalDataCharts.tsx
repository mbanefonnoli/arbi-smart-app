"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CURRENCIES, type Currency } from "@/lib/currencies";
import { Separator } from "@/components/ui/separator";
import { TrendingUpIcon, BarChartIcon, RowsIcon } from "lucide-react";


// Mock data for charts
const mockFluctuationData = {
  "USD-EUR": [
    { month: "Jan", rate: 0.92 }, { month: "Feb", rate: 0.93 }, { month: "Mar", rate: 0.91 },
    { month: "Apr", rate: 0.94 }, { month: "May", rate: 0.93 }, { month: "Jun", rate: 0.95 },
  ],
  "USD-JPY": [
    { month: "Jan", rate: 130 }, { month: "Feb", rate: 132 }, { month: "Mar", rate: 129 },
    { month: "Apr", rate: 133 }, { month: "May", rate: 131 }, { month: "Jun", rate: 135 },
  ],
  "EUR-JPY": [
    { month: "Jan", rate: 141 }, { month: "Feb", rate: 143 }, { month: "Mar", rate: 140 },
    { month: "Apr", rate: 144 }, { month: "May", rate: 142 }, { month: "Jun", rate: 146 },
  ],
};

const mockCorrelationData = [
  { pair1: "USD/EUR", pair2: "USD/JPY", correlation: 0.65 },
  { pair1: "USD/EUR", pair2: "EUR/JPY", correlation: -0.40 },
  { pair1: "USD/JPY", pair2: "EUR/JPY", correlation: 0.85 },
];

const mockVolatilityData = [
  { currency: "USD", volatility: 0.053 }, { currency: "EUR", volatility: 0.048 },
  { currency: "JPY", volatility: 0.061 }, { currency: "GBP", volatility: 0.055 },
  { currency: "AUD", volatility: 0.072 },
];

type FluctuationPair = keyof typeof mockFluctuationData;

export function HistoricalDataCharts() {
  const [selectedFluctuationPair, setSelectedFluctuationPair] = useState<FluctuationPair>("USD-EUR");

  const fluctuationChartConfig = {
    rate: { label: selectedFluctuationPair, color: "hsl(var(--primary))" },
  };

  const volatilityChartConfig = {
    volatility: { label: "Volatility", color: "hsl(var(--accent))" },
  };
  
  const availablePairs = useMemo(() => Object.keys(mockFluctuationData) as FluctuationPair[], []);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center">
            <TrendingUpIcon className="mr-2 h-5 w-5 text-primary" />
            Currency Fluctuations
          </CardTitle>
          <CardDescription>Monthly exchange rate for selected currency pair.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedFluctuationPair} onValueChange={(value) => setSelectedFluctuationPair(value as FluctuationPair)}>
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue placeholder="Select currency pair" />
            </SelectTrigger>
            <SelectContent>
              {availablePairs.map(pair => (
                <SelectItem key={pair} value={pair}>{pair.replace('-', '/')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ChartContainer config={fluctuationChartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockFluctuationData[selectedFluctuationPair]} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" domain={['dataMin - 0.02', 'dataMax + 0.02']} tickFormatter={(value) => typeof value === 'number' ? value.toFixed(selectedFluctuationPair.includes("JPY") ? 0 : 2) : value}/>
                <ChartTooltip content={<ChartTooltipContent hideIndicator />} cursor={{stroke: "hsl(var(--primary))", strokeWidth: 1.5}} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="rate" stroke="var(--color-rate)" strokeWidth={2} dot={{ fill: "var(--color-rate)", r:4 }} activeDot={{r:6}}/>
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Separator />

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center">
              <RowsIcon className="mr-2 h-5 w-5 text-primary" />
              Currency Pair Correlations
            </CardTitle>
            <CardDescription>Correlation coefficients between currency pairs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pair 1</TableHead>
                  <TableHead>Pair 2</TableHead>
                  <TableHead className="text-right">Correlation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCorrelationData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.pair1}</TableCell>
                    <TableCell>{item.pair2}</TableCell>
                    <TableCell className={`text-right font-medium ${item.correlation > 0 ? 'text-accent' : 'text-destructive'}`}>
                      {item.correlation.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center">
              <BarChartIcon className="mr-2 h-5 w-5 text-primary" />
              Currency Volatility
            </CardTitle>
            <CardDescription>Estimated volatility for major currencies.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={volatilityChartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockVolatilityData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="currency" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" tickFormatter={(value) => typeof value === 'number' ? (value * 100).toFixed(1) + '%' : value} />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" hideLabel />} cursor={{fill: "hsl(var(--accent)/0.2)"}}/>
                  <Bar dataKey="volatility" fill="var(--color-volatility)" radius={4}>
                     <LabelList dataKey="currency" position="top" offset={8} className="fill-foreground text-xs" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
