"use client";

import * as React from 'react';
import { CURRENCIES, type Currency } from '@/lib/currencies';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { XIcon, PlusIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface CustomPathBuilderProps {
  path: string[];
  setPath: (path: string[]) => void;
  sourceCurrency: string;
  targetCurrency: string;
}

export function CustomPathBuilder({ path, setPath, sourceCurrency, targetCurrency }: CustomPathBuilderProps) {
  const availableCurrencies = React.useMemo(() => {
    return CURRENCIES.filter(c => c.code !== sourceCurrency && c.code !== targetCurrency);
  }, [sourceCurrency, targetCurrency]);

  const handleAddStop = () => {
    // Add a default currency that isn't already in the path
    const defaultNewCurrency = availableCurrencies.find(c => !path.includes(c.code));
    if (defaultNewCurrency) {
      setPath([...path, defaultNewCurrency.code]);
    }
  };

  const handleRemoveStop = (index: number) => {
    const newPath = [...path];
    newPath.splice(index, 1);
    setPath(newPath);
  };

  const handleUpdateStop = (index: number, newCurrency: string) => {
    const newPath = [...path];
    newPath[index] = newCurrency;
    setPath(newPath);
  };

  const fullPath = [sourceCurrency, ...path, targetCurrency];

  return (
    <Card className="bg-secondary/30 border-dashed">
        <CardHeader>
            <CardTitle className="text-lg font-headline">Build Your Custom Path</CardTitle>
            <CardDescription>Add intermediary currencies to calculate a specific route.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="font-semibold text-primary p-2 bg-primary/10 rounded-md">{sourceCurrency}</div>
                    <div className="text-muted-foreground">&#8594;</div>
                </div>

                {path.map((currency, index) => (
                    <div key={index} className="flex items-center gap-2 pl-4">
                        <Select value={currency} onValueChange={(newCurrency) => handleUpdateStop(index, newCurrency)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableCurrencies.map((c) => (
                                <SelectItem key={c.code} value={c.code} disabled={path.includes(c.code) && path[index] !== c.code}>
                                    {c.code} - {c.name}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveStop(index)} className="text-destructive hover:text-destructive">
                            <XIcon className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                
                <div className="flex items-center justify-center pt-2">
                    <Button variant="outline" onClick={handleAddStop}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Intermediary Currency
                    </Button>
                </div>

                 <div className="flex items-center gap-2 pt-2">
                    <div className="text-muted-foreground">&#8594;</div>
                    <div className="font-semibold text-primary p-2 bg-primary/10 rounded-md">{targetCurrency}</div>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
