
"use client";

import type React from 'react';
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Salad, Beef, Grape, Wheat, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type { Guest, OtherMealPreference } from "@/lib/types";
import { AuthDialog } from "@/components/AuthDialog"; // Import AuthDialog

// Ensure this key is consistent with the one used in src/app/page.tsx
const GUEST_LIST_STORAGE_KEY = "guestListData_v3";

export default function GuestListPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false); // State for AuthDialog

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

  const formatOtherMeals = (otherMeals: OtherMealPreference[] | undefined) => {
    if (!otherMeals || otherMeals.length === 0) return "N/A";
    return otherMeals.map(meal => `${meal.name} (${meal.count})`).join(", ");
  };

  const handleSaveListClick = () => {
    // For now, this just opens the AuthDialog.
    // Actual saving logic would depend on Firebase auth state.
    setIsAuthDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading guest list...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 flex flex-col flex-grow">
      <header className="mb-6 md:mb-8">
        <div className="flex items-center justify-between">
          <Link href="/" passHref>
            <Button variant="outline" size="icon" aria-label="Back to planner">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-headline text-primary text-center flex-grow">
            Guest List Preview
          </h1>
          <Button variant="outline" onClick={handleSaveListClick} className="ml-auto">
            <Save className="mr-2 h-4 w-4" />
            Save List
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        {guests.length === 0 ? (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-center">No Guests Yet</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Your guest list is currently empty. Go back to the planner to add some guests!
              </p>
              <Link href="/" passHref>
                <Button>
                  <Users className="mr-2 h-4 w-4" /> Go to Planner
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg w-full">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                All Guests ({guests.reduce((acc, guest) => acc + guest.adults + guest.children, 0)})
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableCaption>A detailed overview of your guest list.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Family Name</TableHead>
                    <TableHead className="text-center">Adults</TableHead>
                    <TableHead className="text-center">Children</TableHead>
                    <TableHead className="text-center"><Salad className="inline h-4 w-4 mr-1"/>Veg</TableHead>
                    <TableHead className="text-center"><Beef className="inline h-4 w-4 mr-1"/>Non-Veg</TableHead>
                    <TableHead className="text-center"><Grape className="inline h-4 w-4 mr-1"/>Child Meal</TableHead>
                    <TableHead className="min-w-[200px]"><Wheat className="inline h-4 w-4 mr-1"/>Other Meals</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests.map((guest, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{guest.familyName}</TableCell>
                      <TableCell className="text-center">{guest.adults}</TableCell>
                      <TableCell className="text-center">{guest.children}</TableCell>
                      <TableCell className="text-center">{guest.mealPreferences.veg}</TableCell>
                      <TableCell className="text-center">{guest.mealPreferences.nonVeg}</TableCell>
                      <TableCell className="text-center">{guest.mealPreferences.childMeal}</TableCell>
                      <TableCell>{formatOtherMeals(guest.mealPreferences.otherMeals)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
       <footer className="text-center py-6 mt-auto">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Guest List Planner. Preview Page.
        </p>
      </footer>
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        onLinkSent={(email) => {
          // Handle post-link sent logic if needed, e.g., close dialog.
          // The dialog itself shows a toast.
        }}
      />
    </div>
  );
}
