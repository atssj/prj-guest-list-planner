
"use client";

import { PlusCircle, ListChecks } from 'lucide-react';

// Function to scroll to an element
const scrollToElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    // Adding a slight offset to account for potential fixed headers or to provide better visibility
    const yOffset = -20; 
    const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};

export function BottomNavbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border shadow-md md:hidden z-50">
      <div className="container mx-auto h-full">
        <ul className="flex justify-around items-center h-full">
          <li>
            <button
              onClick={() => scrollToElement('guest-form-section')}
              className="flex flex-col items-center justify-center p-2 text-primary hover:text-primary/80 focus:outline-none focus:text-primary/80 rounded-md"
              aria-label="Add Guest"
            >
              <PlusCircle className="h-6 w-6" />
              <span className="text-xs mt-1">Add</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToElement('guest-summary-section')}
              className="flex flex-col items-center justify-center p-2 text-primary hover:text-primary/80 focus:outline-none focus:text-primary/80 rounded-md"
              aria-label="View Summary"
            >
              <ListChecks className="h-6 w-6" />
              <span className="text-xs mt-1">Summary</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
