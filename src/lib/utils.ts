import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { FoodPreference } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFoodPreference(preference: FoodPreference): string {
  switch (preference) {
    case "vegetarian":
      return "Vegetarian";
    case "nonVegetarian":
      return "Non-Vegetarian";
    case "jain":
      return "Jain";
    case "vegan":
      return "Vegan";
    default:
      return preference;
  }
}
