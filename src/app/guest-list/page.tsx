
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
import { AuthDialog } from "@/components/AuthDialog";

const GUEST_LIST_STORAGE_KEY = "guestListData_v3";

export default function GuestListPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

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
          <Link href="/add-guest" passHref>
            <Button variant="outline" size="icon" aria-label="Back to planner">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-headline text-primary text-center flex-grow px-4">
            Your Current Guest List
          </h1>
          {guests.length > 0 && (
            <Button 
              variant="default" 
              onClick={handleSaveListClick}
              aria-label="Save guest list"
            >
              <Save className="mr-2 h-4 w-4" />
              Save List
            </Button>
          )}
          {guests.length === 0 && (
             <div className="w-10 h-10 md:w-auto"></div> 
          )}
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
                Your guest list is looking a bit empty. Start adding guests to see them here!
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={handleSaveListClick}
                  disabled
                  className="w-full sm:w-auto"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save List
                </Button>
                <Link href="/add-guest" passHref>
                  <Button variant="default" className="w-full sm:w-auto">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Planner
                  </Button>
                </Link>
              </div>
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
                <TableCaption>Here's everyone you've added so far.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Family Name</TableHead>
                    <TableHead className="text-center">Adults</TableHead>
                    <TableHead className="text-center">Children</TableHead>
                    <TableHead className="text-center"><Salad className="inline h-4 w-4 mr-1"/>Vegetarian</TableHead>
                    <TableHead className="text-center"><Beef className="inline h-4 w-4 mr-1"/>Non-Veg</TableHead>
                    <TableHead className="text-center"><Grape className="inline h-4 w-4 mr-1"/>Kid's Meal</TableHead>
                    <TableHead className="min-w-[200px]"><Wheat className="inline h-4 w-4 mr-1"/>Special Meals</TableHead>
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
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        onLinkSent={(email) => {
          // Handle post-link sent logic if needed
        }}
      />
    </div>
  );
}
