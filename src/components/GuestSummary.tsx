"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FOOD_PREFERENCES, type GuestSummaryData, type FoodPreference } from "@/lib/types";
import { formatFoodPreference } from "@/lib/utils";
import { Users, Baby, UtensilsCrossed, Leaf, Drumstick, Sparkles, ListChecks } from "lucide-react";

interface GuestSummaryProps {
  summary: GuestSummaryData;
}

const foodPreferenceIcons: Record<FoodPreference, React.ElementType> = {
  vegetarian: Leaf,
  nonVegetarian: Drumstick,
  jain: Sparkles, // Using Sparkles as a metaphor for special/pure
  vegan: Leaf, // Could use a different icon if distinction is highly needed
};

export function GuestSummary({ summary }: GuestSummaryProps) {
  return (
    <Card className="shadow-lg animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          Guest Summary
        </CardTitle>
        <CardDescription>Real-time overview of your guest list.</CardDescription>
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
            Food Preferences Breakdown
          </h3>
          <div className="space-y-2">
            {FOOD_PREFERENCES.map((pref) => {
              const IconComponent = foodPreferenceIcons[pref as FoodPreference];
              return (
                <div key={pref} className="flex justify-between items-center p-2 border-b last:border-b-0">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <span>{formatFoodPreference(pref as FoodPreference)}</span>
                  </div>
                  <span className="font-medium">{summary.foodPreferences[pref as FoodPreference]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
