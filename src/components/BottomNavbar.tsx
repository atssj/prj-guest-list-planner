
"use client";

import { PlusCircle, ListChecks, Mic, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { scrollToElement } from '@/lib/utils';


export function BottomNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const isMainPage = pathname === '/';
  const isGuestListPage = pathname === '/guest-list';

  const getItemClasses = (isActive: boolean) => {
    return cn(
      "flex flex-col items-center justify-center p-2 rounded-md focus:outline-none w-full h-full", // Ensure buttons take full space
      isActive 
        ? "text-accent hover:text-accent/90 focus:text-accent/90" 
        : "text-muted-foreground hover:text-primary focus:text-primary"
    );
  };

  const handleNavAndScroll = (elementId: string) => {
    if (pathname === '/guest-list') {
      router.push(`/#${elementId}`);
    } else {
      scrollToElement(elementId);
    }
  };


  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border shadow-md md:hidden z-50">
      <div className="container mx-auto h-full">
        <ul className="flex justify-around items-center h-full">
          <li className="flex-1 h-full">
            <button
              onClick={() => handleNavAndScroll('guest-form-section')}
              className={getItemClasses(isMainPage)}
              aria-label="Add Guest"
              aria-current={isMainPage ? "page" : undefined}
            >
              <PlusCircle className="h-6 w-6" />
              <span className="text-xs mt-1">Add</span>
            </button>
          </li>
          <li className="flex-1 h-full">
            <button
              onClick={() => handleNavAndScroll('guest-form-section')} 
              className={getItemClasses(isMainPage)}
              aria-label="Use Voice Input"
              aria-current={isMainPage ? "page" : undefined}
            >
              <Mic className="h-6 w-6" />
              <span className="text-xs mt-1">Voice</span>
            </button>
          </li>
          <li className="flex-1 h-full">
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
          <li className="flex-1 h-full">
            <button
              onClick={() => handleNavAndScroll('guest-summary-section')}
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
