
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { GuestSummaryData } from "@/lib/types";
import { Users, Baby, UtensilsCrossed, ListChecks, Salad, Beef, Grape, Wheat, Save, Printer, Share2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GuestSummaryProps {
  summary: GuestSummaryData;
  onSaveListClick?: () => void;
}

export function GuestSummary({ summary, onSaveListClick }: GuestSummaryProps) {
  const handlePrint = () => {
    console.log("Print button clicked");
    window.print();
  };

  const handleShare = async () => {
    console.log("Share button clicked");
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Guest List Summary',
          text: `Here's the guest list summary: ${summary.totalGuests} guests. Adults: ${summary.totalAdults}, Children: ${summary.totalChildren}.`,
        });
        console.log('Content shared successfully');
      } catch (error) {
        console.error('Error sharing:', error);
        alert('Sharing failed. Your browser might not support this feature or there was an error.');
      }
    } else {
      alert('Share functionality is not supported in your browser. You can manually copy the details.');
    }
  };

  return (
    <Card className="shadow-lg animate-in fade-in-50 duration-500 flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <ListChecks className="h-6 w-6 text-primary" />
              Guest Summary
            </CardTitle>
            <CardDescription>Real-time overview of your guest list.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
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
      <CardFooter className="mt-auto pt-6">
        <div className="flex w-full gap-0">
          {onSaveListClick && (
            <Button variant="outline" onClick={onSaveListClick} className="flex-1 shadow-md rounded-r-none">
              <Save className="mr-2 h-4 w-4" />
              Save List
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="px-2 shadow-md rounded-l-none border-l-0">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}
