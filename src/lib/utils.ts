
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// formatFoodPreference is no longer needed with the new meal count structure.
// export function formatFoodPreference(preference: FoodPreference): string {
//   switch (preference) {
//     case "vegetarian":
//       return "Vegetarian";
//     case "nonVegetarian":
//       return "Non-Vegetarian";
//     case "jain":
//       return "Jain";
//     case "vegan":
//       return "Vegan";
//     default:
//       return preference;
//   }
// }
