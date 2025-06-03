
export interface OtherMealPreference {
  name: string;
  count: number;
}

export interface MealPreferences {
  veg: number;
  nonVeg: number;
  childMeal: number;
  otherMeals: OtherMealPreference[]; // Changed from otherName/otherCount
}

export interface Guest {
  familyName: string;
  adults: number;
  children: number;
  mealPreferences: MealPreferences;
}

export interface GuestSummaryData {
  totalAdults: number;
  totalChildren: number;
  totalGuests: number;
  mealCounts: {
    veg: number;
    nonVeg: number;
    childMeal: number;
    other: number; // This will sum counts from all otherMeals
  };
}

export const INITIAL_SUMMARY: GuestSummaryData = {
  totalAdults: 0,
  totalChildren: 0,
  totalGuests: 0,
  mealCounts: {
    veg: 0,
    nonVeg: 0,
    childMeal: 0,
    other: 0,
  },
};
