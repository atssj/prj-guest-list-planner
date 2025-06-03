
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const scrollToElement = (elementId: string, yOffset: number = -20) => {
  const element = document.getElementById(elementId);
  if (element) {
    // Ensure the element is in view before trying to get its position,
    // especially after a page navigation. A small delay can help.
    setTimeout(() => {
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }, 50); // Adjust delay if necessary
  }
};
