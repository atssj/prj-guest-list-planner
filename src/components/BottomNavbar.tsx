
"use client";

import { PlusCircle, ListChecks, Mic, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { scrollToElement } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function BottomNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAddPageActive = mounted ? pathname === '/' : false;
  const isGuestListPageActive = mounted ? pathname === '/guest-list' : false;
  const isSummaryPageActive = mounted ? pathname === '/summary' : false;

  const getItemClasses = (isActive: boolean) => {
    return cn(
      "flex flex-col items-center justify-center p-2 rounded-md focus:outline-none w-full h-full",
      isActive 
        ? "text-accent hover:text-accent/90 focus:text-accent/90" 
        : "text-muted-foreground hover:text-primary focus:text-primary"
    );
  };

  const handleNavAndScrollToForm = () => {
    if (pathname !== '/') { 
      router.push(`/#guest-form-section`);
    } else {
      scrollToElement('guest-form-section');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border shadow-md md:hidden z-50">
      <div className="container mx-auto h-full">
        <ul className="flex justify-around items-center h-full">
          <li className="flex-1 h-full">
            <button
              onClick={handleNavAndScrollToForm}
              className={getItemClasses(isAddPageActive)}
              aria-label="Add Guest"
              aria-current={mounted && isAddPageActive ? "page" : undefined}
            >
              <PlusCircle className="h-6 w-6" />
              <span className="text-xs mt-1">Add</span>
            </button>
          </li>
          <li className="flex-1 h-full">
            <button
              onClick={handleNavAndScrollToForm} 
              className={getItemClasses(isAddPageActive)} // Voice input is part of Add page
              aria-label="Use Voice Input"
              aria-current={mounted && isAddPageActive ? "page" : undefined}
            >
              <Mic className="h-6 w-6" />
              <span className="text-xs mt-1">Voice</span>
            </button>
          </li>
          <li className="flex-1 h-full">
            <Link href="/guest-list" passHref legacyBehavior>
              <a 
                className={getItemClasses(isGuestListPageActive)}
                aria-label="View Guest List"
                aria-current={mounted && isGuestListPageActive ? "page" : undefined}
              >
                <Users className="h-6 w-6" />
                <span className="text-xs mt-1">List</span>
              </a>
            </Link>
          </li>
          <li className="flex-1 h-full">
            <Link href="/summary" passHref legacyBehavior>
              <a
                className={getItemClasses(isSummaryPageActive)}
                aria-label="View Summary"
                aria-current={mounted && isSummaryPageActive ? "page" : undefined}
              >
                <ListChecks className="h-6 w-6" />
                <span className="text-xs mt-1">Summary</span>
              </a>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
