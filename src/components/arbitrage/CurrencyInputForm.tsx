
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler, type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CURRENCIES, type Currency } from "@/lib/currencies";
import type { FindArbitrageOpportunitiesInput } from "@/ai/flows/arbitrage-finder-tool";
import { Loader2, SearchIcon, BuildingIcon, Sparkles, Wrench } from "lucide-react";
import React from "react";

const formSchema = z.object({
  sourceCurrency: z.string().min(1, "Source currency is required."),
  targetCurrency: z.string().min(1, "Target currency is required."),
  amount: z.coerce.number().positive("Amount must be positive."),
  platform: z.string().optional(),
});

type CurrencyInputFormValues = z.infer<typeof formSchema>;

interface CurrencyInputFormProps {
  onSubmit: (data: Omit<FindArbitrageOpportunitiesInput, 'customPath'>) => Promise<void>;
  loading: boolean;
  mode: "ai-optimized" | "custom-path";
  children?: (form: UseFormReturn<CurrencyInputFormValues>) => React.ReactNode;
}

const platformOptions = [
  { value: "any_platform", label: "Any Platform" },
  { value: "Wise", label: "Wise" },
  { value: "Revolut", label: "Revolut" },
];

export function CurrencyInputForm({ onSubmit, loading, mode, children }: CurrencyInputFormProps) {
  const form = useForm<CurrencyInputFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sourceCurrency: "USD",
      targetCurrency: "EUR",
      amount: 100,
      platform: "any_platform",
    },
  });

  const handleSubmit: SubmitHandler<CurrencyInputFormValues> = async (data) => {
    const submissionData = {
      ...data,
      platform: data.platform === "any_platform" ? undefined : data.platform, 
    };
    await onSubmit(submissionData);
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-none border-0">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center text-primary">Converter</CardTitle>
        <CardDescription className="text-center">
            {mode === 'ai-optimized' 
                ? 'Let the AI find the best arbitrage path for you.'
                : 'Define your own path for a specific calculation.'
            }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="sourceCurrency"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>From Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select source currency" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {CURRENCIES.map((currency: Currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="targetCurrency"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>To Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select target currency" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {CURRENCIES.map((currency: Currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter amount" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <BuildingIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    Preferred Platform (Optional)
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {platformOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Render children if they exist, passing the form context */}
            {children && children(form)}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : mode === 'ai-optimized' ? (
                <Sparkles className="mr-2 h-4 w-4" />
              ) : (
                <Wrench className="mr-2 h-4 w-4" />
              )}
              {mode === 'ai-optimized' ? 'Find Arbitrage' : 'Calculate Custom Path'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
