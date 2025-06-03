
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Guest, MealPreferences, OtherMealPreference } from "@/lib/types";
import { PlusCircle, Users, Utensils, Salad, Beef, Grape, Wheat, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React from "react";

const otherMealPreferenceSchema = z.object({
  name: z.string().min(1, "Meal name is required."),
  count: z.coerce.number().min(1, "Count must be at least 1.").int("Must be a whole number."),
});

const mealPreferencesSchema = z.object({
  veg: z.coerce.number().min(0, "Cannot be negative").int("Must be a whole number"),
  nonVeg: z.coerce.number().min(0, "Cannot be negative").int("Must be a whole number"),
  childMeal: z.coerce.number().min(0, "Cannot be negative").int("Must be a whole number"),
  otherMeals: z.array(otherMealPreferenceSchema).optional(),
});

const guestFormSchema = z.object({
  familyName: z.string().min(1, "Family name is required."),
  adults: z.coerce.number().min(0, "Number of adults must be 0 or more.").int(),
  children: z.coerce.number().min(0, "Number of children must be 0 or more.").int(),
  mealPreferences: mealPreferencesSchema,
})
.refine((data) => data.adults + data.children > 0, {
  message: "At least one guest (adult or child) is required.",
  path: ["adults"],
})
.refine(
  (data) => {
    const totalPeople = data.adults + data.children;
    const otherMealsCount = data.mealPreferences.otherMeals?.reduce((sum, meal) => sum + (meal.count || 0), 0) || 0;
    const totalMeals =
      (data.mealPreferences.veg || 0) +
      (data.mealPreferences.nonVeg || 0) +
      (data.mealPreferences.childMeal || 0) +
      otherMealsCount;
    return totalMeals === totalPeople;
  },
  {
    message: "Total number of meals must equal the total number of adults and children.",
    path: ["mealPreferences.veg"], 
  }
);

type GuestFormValues = z.infer<typeof guestFormSchema>;

interface GuestFormProps {
  onAddGuest: (guest: Guest) => void;
}

export function GuestForm({ onAddGuest }: GuestFormProps) {
  const { toast } = useToast();
  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      familyName: "",
      adults: 0,
      children: 0,
      mealPreferences: {
        veg: 0,
        nonVeg: 0,
        childMeal: 0,
        otherMeals: [],
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "mealPreferences.otherMeals",
  });

  function onSubmit(data: GuestFormValues) {
    const guestData: Guest = {
      ...data,
      mealPreferences: {
        ...data.mealPreferences,
        otherMeals: data.mealPreferences.otherMeals || [],
      },
    };
    onAddGuest(guestData);
    toast({
      title: "Guest Added",
      description: `${data.familyName} family has been added to the list.`,
    });
    form.reset();
  }

  const adultsCount = form.watch("adults");
  const childrenCount = form.watch("children");
  const totalPeople = (adultsCount || 0) + (childrenCount || 0);

  return (
    <Card className="shadow-lg w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Add Guest
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="familyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Family Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Sharma Family" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="adults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adults</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} min="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="children"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Children</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} min="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-3 border p-3 rounded-md shadow-sm bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Meal Preferences</h3>
              </div>
              <FormDescription>
                Total meals should sum up to {totalPeople} (total adults + children).
              </FormDescription>

              <FormField
                control={form.control}
                name="mealPreferences.veg"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="flex items-center gap-2"><Salad className="h-4 w-4 text-green-600"/>Vegetarian</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} min="0" className="w-20 text-center" />
                    </FormControl>
                  </FormItem>
                )}
              />
               <FormMessage className="text-right -mt-3">
                {form.formState.errors.mealPreferences?.veg?.message}
              </FormMessage>

              <FormField
                control={form.control}
                name="mealPreferences.nonVeg"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="flex items-center gap-2"><Beef className="h-4 w-4 text-red-600"/>Non-Vegetarian</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} min="0" className="w-20 text-center" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormMessage className="text-right -mt-3">
                {form.formState.errors.mealPreferences?.nonVeg?.message}
              </FormMessage>

              <FormField
                control={form.control}
                name="mealPreferences.childMeal"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="flex items-center gap-2"><Grape className="h-4 w-4 text-purple-600"/>Child Meal</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} min="0" className="w-20 text-center" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormMessage className="text-right -mt-3">
                {form.formState.errors.mealPreferences?.childMeal?.message}
              </FormMessage>
              
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2"><Wheat className="h-4 w-4 text-yellow-600"/>Other Meal(s)</FormLabel>
                {fields.map((item, index) => (
                  <div key={item.id} className="p-2 border rounded-md bg-background/50 shadow-inner">
                    <div className="grid grid-cols-10 gap-2 items-center">
                      <FormField
                        control={form.control}
                        name={`mealPreferences.otherMeals.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="col-span-7"> 
                            <FormLabel className="sr-only">Other Meal Name {index + 1}</FormLabel>
                            <FormControl>
                              <Input placeholder="Meal Name" {...field} />
                            </FormControl>
                             <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`mealPreferences.otherMeals.${index}.count`}
                        render={({ field }) => (
                          <FormItem className="col-span-2"> 
                             <FormLabel className="sr-only">Other Meal Count {index + 1}</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} min="1" className="text-center" />
                            </FormControl>
                             <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="link"
                        size="icon"
                        onClick={() => remove(index)}
                        className="col-span-1 text-destructive mt-0"
                        aria-label={`Remove other meal ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                   
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: "", count: 1 })}
                  className="w-full"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Other Meal
                </Button>
                 {form.formState.errors.mealPreferences?.otherMeals?.root?.message && (
                    <FormMessage>{form.formState.errors.mealPreferences.otherMeals.root.message}</FormMessage>
                 )}
                  {Array.isArray(form.formState.errors.mealPreferences?.otherMeals) &&
                    form.formState.errors.mealPreferences.otherMeals.map((error, index) => (
                      <div key={index}>
                        {error?.name && <FormMessage>{`Other Meal ${index + 1} Name: ${error.name.message}`}</FormMessage>}
                        {error?.count && <FormMessage>{`Other Meal ${index + 1} Count: ${error.count.message}`}</FormMessage>}
                      </div>
                  ))}
              </div>
              
               <FormMessage>
                { (form.formState.errors.mealPreferences as any)?.veg?.message && (form.formState.errors.mealPreferences as any)?.veg.type === 'custom' ? (form.formState.errors.mealPreferences as any)?.veg.message : null}
               </FormMessage>
            </div>

            <Button type="submit" className="w-full text-lg py-4 bg-accent hover:bg-accent/90 text-accent-foreground">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Guest
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

