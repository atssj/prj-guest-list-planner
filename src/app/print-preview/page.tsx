
"use client";

import type React from 'react';
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Users, Salad, Beef, Grape, Wheat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuestSummary } from "@/components/GuestSummary";
import type { Guest, GuestSummaryData, OtherMealPreference } from "@/lib/types";
import { INITIAL_SUMMARY } from "@/lib/types";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GUEST_LIST_STORAGE_KEY = "guestListData_v3";

export default function PrintPreviewPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [summary, setSummary] = useState<GuestSummaryData>(INITIAL_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedGuests = localStorage.getItem(GUEST_LIST_STORAGE_KEY);
    if (storedGuests) {
      try {
        const parsedGuests = JSON.parse(storedGuests) as Guest[];
        if (Array.isArray(parsedGuests)) {
          setGuests(parsedGuests);
        }
      } catch (error) {
        console.error("Error parsing guests from local storage:", error);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let totalAdults = 0;
    let totalChildren = 0;
    const newMealCounts = { veg: 0, nonVeg: 0, childMeal: 0, other: 0 };

    guests.forEach((guest) => {
      totalAdults += guest.adults;
      totalChildren += guest.children;
      
      if (guest.mealPreferences) {
        newMealCounts.veg += guest.mealPreferences.veg || 0;
        newMealCounts.nonVeg += guest.mealPreferences.nonVeg || 0;
        newMealCounts.childMeal += guest.mealPreferences.childMeal || 0;
        if (guest.mealPreferences.otherMeals) {
          guest.mealPreferences.otherMeals.forEach((otherMeal: OtherMealPreference) => {
            newMealCounts.other += otherMeal.count || 0;
          });
        }
      }
    });

    setSummary({
      totalAdults,
      totalChildren,
      totalGuests: totalAdults + totalChildren,
      mealCounts: newMealCounts,
    });
  }, [guests]);

  const handlePrint = () => {
    window.print();
  };

  const formatOtherMeals = (otherMeals: OtherMealPreference[] | undefined) => {
    if (!otherMeals || otherMeals.length === 0) return "N/A";
    return otherMeals.map(meal => `${meal.name} (${meal.count})`).join(", ");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading print preview...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-4 md:px-4 md:py-6 flex flex-col flex-grow print-preview-page">
      <header className="mb-4 md:mb-6 print-hide">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()} size="icon" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-headline text-primary text-center flex-grow px-4">
            Print Preview
          </h1>
          <Button variant="default" onClick={handlePrint} aria-label="Print page">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </header>

      <main className="flex-grow space-y-6">
        <section aria-labelledby="summary-section-title">
          <h2 id="summary-section-title" className="sr-only">Guest Summary</h2>
          <GuestSummary summary={summary} isSaveDisabled={true} /> 
        </section>

        <Separator className="print-hide" />
        
        <section aria-labelledby="guest-list-section-title">
           <h2 id="guest-list-section-title" className="text-xl sm:text-2xl font-headline text-primary mb-3 text-center print-only-title">
            Full Guest List
          </h2>
          {guests.length === 0 ? (
            <Card className="shadow-md print-hide-empty-list">
              <CardHeader>
                <CardTitle className="text-center">No Guests Yet</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">Your guest list is currently empty.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg w-full print-card">
              <CardHeader className="print-hide">
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  All Guests ({guests.reduce((acc, guest) => acc + guest.adults + guest.children, 0)})
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto p-2 sm:p-4 print-card-content">
                <Table>
                  <TableCaption className="print-hide">A detailed overview of your guest list for printing.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px] sm:min-w-[150px] text-xs sm:text-sm">Family Name</TableHead>
                      <TableHead className="text-center text-xs sm:text-sm">Adults</TableHead>
                      <TableHead className="text-center text-xs sm:text-sm">Children</TableHead>
                      <TableHead className="text-center text-xs sm:text-sm"><Salad className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1"/>Veg</TableHead>
                      <TableHead className="text-center text-xs sm:text-sm"><Beef className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1"/>Non-Veg</TableHead>
                      <TableHead className="text-center text-xs sm:text-sm"><Grape className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1"/>Child</TableHead>
                      <TableHead className="min-w-[150px] sm:min-w-[200px] text-xs sm:text-sm"><Wheat className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1"/>Other</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guests.map((guest, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-xs sm:text-sm py-2 px-1 sm:px-2">{guest.familyName}</TableCell>
                        <TableCell className="text-center text-xs sm:text-sm py-2 px-1 sm:px-2">{guest.adults}</TableCell>
                        <TableCell className="text-center text-xs sm:text-sm py-2 px-1 sm:px-2">{guest.children}</TableCell>
                        <TableCell className="text-center text-xs sm:text-sm py-2 px-1 sm:px-2">{guest.mealPreferences.veg}</TableCell>
                        <TableCell className="text-center text-xs sm:text-sm py-2 px-1 sm:px-2">{guest.mealPreferences.nonVeg}</TableCell>
                        <TableCell className="text-center text-xs sm:text-sm py-2 px-1 sm:px-2">{guest.mealPreferences.childMeal}</TableCell>
                        <TableCell className="text-xs sm:text-sm py-2 px-1 sm:px-2">{formatOtherMeals(guest.mealPreferences.otherMeals)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
