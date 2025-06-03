
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FOOD_PREFERENCES, type FoodPreference, type Guest } from "@/lib/types";
import { formatFoodPreference } from "@/lib/utils";
import { PlusCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const guestFormSchema = z.object({
  familyName: z.string().min(1, "Family name is required."),
  adults: z.coerce.number().min(0, "Number of adults must be 0 or more.").int(),
  children: z.coerce.number().min(0, "Number of children must be 0 or more.").int(),
  foodPreference: z.enum(FOOD_PREFERENCES, {
    required_error: "Please select a food preference.",
  }),
}).refine((data) => data.adults + data.children > 0, {
  message: "At least one guest (adult or child) is required.",
  path: ["adults"], 
});

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
      foodPreference: undefined,
    },
  });

  function onSubmit(data: GuestFormValues) {
    onAddGuest(data as Guest);
    toast({
      title: "Guest Added",
      description: `${data.familyName} family has been added to the list.`,
    });
    form.reset();
  }

  return (
    <Card className="shadow-lg w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Add Guest Family
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            <FormField
              control={form.control}
              name="foodPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Preference</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a food preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FOOD_PREFERENCES.map((pref) => (
                        <SelectItem key={pref} value={pref}>
                          {formatFoodPreference(pref as FoodPreference)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Guest
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
