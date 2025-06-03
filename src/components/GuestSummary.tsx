
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { GuestSummaryData } from "@/lib/types";
import { Users, Baby, UtensilsCrossed, ListChecks, Salad, Beef, Grape, Wheat, Save, Printer, Share2, ChevronDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link"; // Added for Print Preview link

interface GuestSummaryProps {
  summary: GuestSummaryData;
  onSaveListClick?: () => void;
  isSaveDisabled?: boolean;
}

export function GuestSummary({ summary, onSaveListClick, isSaveDisabled = false }: GuestSummaryProps) {
  const handlePrint = () => {
    // This print is for the current page, not the dedicated print preview page
    // For a more dedicated print experience, direct to print-preview page
    window.print(); 
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Guest List Summary',
          text: `Here's the guest list summary: ${summary.totalGuests} guests. Adults: ${summary.totalAdults}, Children: ${summary.totalChildren}.`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Consider a toast notification for errors
        alert('Sharing failed. Your browser might not support this feature or there was an error.');
      }
    } else {
      alert('Share functionality is not supported in your browser. You can manually copy the details.');
    }
  };

  return (
    <Card className="shadow-lg animate-in fade-in-50 duration-500 flex flex-col h-full print-card-summary">
      <CardHeader className="print-card-header">
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
      <CardContent className="space-y-4 flex-grow print-card-content">
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

        <Separator className="my-4 print-hide" />

        <div className="print-meal-counts">
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
      {/* Conditionally render CardFooter only if onSaveListClick is provided */}
      {onSaveListClick && (
        <CardFooter className="mt-auto pt-6 print-hide">
          <div className="flex w-full gap-0">
            <Button 
              variant="outline" 
              onClick={onSaveListClick} 
              className="flex-1 shadow-md rounded-r-none"
              disabled={isSaveDisabled}
            >
              <Save className="mr-2 h-4 w-4" />
              Save List
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="px-2 shadow-md rounded-l-none border-l-0"
                  disabled={isSaveDisabled}
                  aria-label="More options"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Current View
                </DropdownMenuItem>
                <Link href="/print-preview" passHref legacyBehavior>
                  <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" />
                    Go to Print Preview
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Summary
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
