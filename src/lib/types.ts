
export interface MealPreferences {
  veg: number;
  nonVeg: number;
  childMeal: number;
  otherName?: string;
  otherCount?: number;
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
    other: number;
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

// FOOD_PREFERENCES and FoodPreference type are no longer needed.
// export const FOOD_PREFERENCES = ["vegetarian", "nonVegetarian", "jain", "vegan"] as const;
// export type FoodPreference = (typeof FOOD_PREFERENCES)[number];
