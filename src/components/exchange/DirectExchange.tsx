
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CURRENCIES, type Currency } from "@/lib/currencies";
import { getDirectExchange } from "@/app/actions";
import type { DirectExchangeInput, DirectExchangeOutput } from "@/ai/flows/direct-exchange-flow";
import { Loader2, ArrowRightLeft, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  sourceCurrency: z.string().min(1, "Source currency is required."),
  targetCurrency: z.string().min(1, "Target currency is required."),
  amount: z.coerce.number().positive("Amount must be positive."),
});

type FormValues = z.infer<typeof formSchema>;

export function DirectExchange() {
  const [exchangeResult, setExchangeResult] = useState<DirectExchangeOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sourceCurrency: "USD",
      targetCurrency: "EUR",
      amount: 100,
    },
  });

  const handleSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setExchangeResult(null);
    try {
      const result = await getDirectExchange(data);
      setExchangeResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (value: number, currencyCode: string) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(value);
    } catch (e) {
      return `${value.toFixed(4)} ${currencyCode}`;
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center text-primary">Converter</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="sourceCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From</FormLabel>
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
                  <FormLabel>To</FormLabel>
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRightLeft className="mr-2 h-4 w-4" />
              )}
              Convert
            </Button>
          </form>
        </Form>
        
        {exchangeResult && (
          <Card className="mt-6 bg-primary/10 border-primary">
            <CardHeader>
              <CardTitle className="text-xl font-headline text-primary">Conversion Result</CardTitle>
              <CardDescription>
                {formatCurrency(form.getValues('amount'), form.getValues('sourceCurrency'))} equals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(exchangeResult.convertedAmount, form.getValues('targetCurrency'))}
              </p>
              <p className="text-sm text-muted-foreground mt-2 flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Exchange Rate: 1 {form.getValues('sourceCurrency')} = {exchangeResult.exchangeRate.toFixed(4)} {form.getValues('targetCurrency')}
              </p>
            </CardContent>
          </Card>
        )}

      </CardContent>
    </Card>
  );
}
