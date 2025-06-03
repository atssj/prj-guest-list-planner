
"use client";

import { PlusCircle, ListChecks, Mic, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

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
  const pathname = usePathname();

  const isMainPage = pathname === '/';
  const isGuestListPage = pathname === '/guest-list';

  const getItemClasses = (isActive: boolean) => {
    return cn(
      "flex flex-col items-center justify-center p-2 rounded-md focus:outline-none",
      isActive 
        ? "text-accent hover:text-accent/90 focus:text-accent/90" 
        : "text-muted-foreground hover:text-primary focus:text-primary"
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border shadow-md md:hidden z-50">
      <div className="container mx-auto h-full">
        <ul className="flex justify-around items-center h-full">
          <li>
            <button
              onClick={() => scrollToElement('guest-form-section')}
              className={getItemClasses(isMainPage)}
              aria-label="Add Guest"
              aria-current={isMainPage ? "page" : undefined}
            >
              <PlusCircle className="h-6 w-6" />
              <span className="text-xs mt-1">Add</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToElement('guest-form-section')} // Assuming voice input also targets form section
              className={getItemClasses(isMainPage)}
              aria-label="Use Voice Input"
              aria-current={isMainPage ? "page" : undefined}
            >
              <Mic className="h-6 w-6" />
              <span className="text-xs mt-1">Voice</span>
            </button>
          </li>
          <li>
            <Link href="/guest-list" passHref legacyBehavior>
              <a 
                className={getItemClasses(isGuestListPage)}
                aria-label="View Guest List"
                aria-current={isGuestListPage ? "page" : undefined}
              >
                <Users className="h-6 w-6" />
                <span className="text-xs mt-1">List</span>
              </a>
            </Link>
          </li>
          <li>
            <button
              onClick={() => scrollToElement('guest-summary-section')}
              className={getItemClasses(isMainPage)}
              aria-label="View Summary"
              aria-current={isMainPage ? "page" : undefined}
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
