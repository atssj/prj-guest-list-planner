
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { GuestSummaryData } from "@/lib/types";
import { Users, Baby, UtensilsCrossed, ListChecks, Salad, Beef, Grape, Wheat, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GuestSummaryProps {
  summary: GuestSummaryData;
  onSaveListClick?: () => void;
}

export function GuestSummary({ summary, onSaveListClick }: GuestSummaryProps) {
  return (
    <Card className="shadow-lg animate-in fade-in-50 duration-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <ListChecks className="h-6 w-6 text-primary" />
              Guest Summary
            </CardTitle>
            <CardDescription>Real-time overview of your guest list.</CardDescription>
          </div>
          {onSaveListClick && (
            <Button variant="outline" onClick={onSaveListClick} className="shadow-md ml-auto shrink-0">
              <Save className="mr-2 h-4 w-4" />
              Save List
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-medium">Total Adults</span>
          </div>
          <span className="text-xl font-bold text-primary">{summary.totalAdults}</span>
        </div>

        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
          <div className="flex items-center gap-2">
            <Baby className="h-5 w-5 text-primary" />
            <span className="font-medium">Total Children</span>
          </div>
          <span className="text-xl font-bold text-primary">{summary.totalChildren}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-primary text-primary-foreground rounded-md">
           <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <span className="text-lg font-semibold">Total Guests</span>
          </div>
          <span className="text-2xl font-bold">{summary.totalGuests}</span>
        </div>

        <Separator className="my-4" />

        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 font-headline text-primary">
            <UtensilsCrossed className="h-5 w-5" />
            Meal Counts Breakdown
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 border-b">
              <div className="flex items-center gap-2">
                <Salad className="h-5 w-5 text-green-600" />
                <span>Vegetarian Meals</span>
              </div>
              <span className="font-medium">{summary.mealCounts.veg}</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b">
              <div className="flex items-center gap-2">
                <Beef className="h-5 w-5 text-red-600" />
                <span>Non-Vegetarian Meals</span>
              </div>
              <span className="font-medium">{summary.mealCounts.nonVeg}</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b">
              <div className="flex items-center gap-2">
                <Grape className="h-5 w-5 text-purple-600" /> 
                <span>Child Meals</span>
              </div>
              <span className="font-medium">{summary.mealCounts.childMeal}</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b last:border-b-0">
              <div className="flex items-center gap-2">
                <Wheat className="h-5 w-5 text-yellow-600" />
                <span>Other Meals</span>
              </div>
              <span className="font-medium">{summary.mealCounts.other}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
