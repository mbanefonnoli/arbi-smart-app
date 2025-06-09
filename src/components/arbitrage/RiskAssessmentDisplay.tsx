"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface RiskAssessmentDisplayProps {
  warnings: string[];
}

export function RiskAssessmentDisplay({ warnings }: RiskAssessmentDisplayProps) {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg border-destructive/50">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-destructive flex items-center">
          <AlertTriangle className="mr-2 h-6 w-6" />
          Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {warnings.map((warning, index) => (
            <Alert key={index} variant="destructive" className="bg-destructive/10">
              <AlertTriangle className="h-4 w-4 !text-destructive" />
              <AlertTitle className="font-semibold">Warning</AlertTitle>
              <AlertDescription>{warning}</AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
