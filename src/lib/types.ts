export const FOOD_PREFERENCES = ["vegetarian", "nonVegetarian", "jain", "vegan"] as const;
export type FoodPreference = (typeof FOOD_PREFERENCES)[number];

export interface Guest {
  familyName: string;
  adults: number;
  children: number;
  foodPreference: FoodPreference;
}

export interface GuestSummaryData {
  totalAdults: number;
  totalChildren: number;
  totalGuests: number;
  foodPreferences: Record<FoodPreference, number>;
}

export const INITIAL_SUMMARY: GuestSummaryData = {
  totalAdults: 0,
  totalChildren: 0,
  totalGuests: 0,
  foodPreferences: {
    vegetarian: 0,
    nonVegetarian: 0,
    jain: 0,
    vegan: 0,
  },
};
