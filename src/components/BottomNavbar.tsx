
"use client";

import { PlusCircle, ListChecks, Users, UserCircle2 } from 'lucide-react';
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

  const isAddPageActive = mounted ? pathname === '/add-guest' : false;
  const isSummaryPageActive = mounted ? pathname === '/summary' : false;
  const isGuestListPageActive = mounted ? pathname === '/guest-list' : false;
  const isProfilePageActive = mounted ? pathname === '/profile' : false;

  const getItemClasses = (isActive: boolean) => {
    return cn(
      "flex flex-col items-center justify-center p-2 rounded-md focus:outline-none w-full h-full",
      isActive 
        ? "text-accent hover:text-accent/90 focus:text-accent/90" 
        : "text-muted-foreground hover:text-primary focus:text-primary"
    );
  };

  const handleNavAndScrollToForm = () => {
    if (pathname !== '/add-guest') { 
      router.push(`/add-guest#guest-form-section`);
    } else {
      scrollToElement('guest-form-section');
    }
  };

  const handleScrollToTopIfCurrentPage = (targetPath: string, event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === targetPath) {
      event.preventDefault(); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border shadow-md z-50">
      <div className="container mx-auto h-full">
        <ul className="flex justify-around items-center h-full">
          {/* 1. Add Button */}
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

          {/* 2. Summary Button */}
          <li className="flex-1 h-full">
            <Link href="/summary" passHref legacyBehavior>
              <a
                className={getItemClasses(isSummaryPageActive)}
                aria-label="View Summary"
                aria-current={mounted && isSummaryPageActive ? "page" : undefined}
                onClick={(e) => handleScrollToTopIfCurrentPage('/summary', e)}
              >
                <ListChecks className="h-6 w-6" />
                <span className="text-xs mt-1">Summary</span>
              </a>
            </Link>
          </li>

          {/* 3. List Button */}
          <li className="flex-1 h-full">
            <Link href="/guest-list" passHref legacyBehavior>
              <a 
                className={getItemClasses(isGuestListPageActive)}
                aria-label="View Guest List"
                aria-current={mounted && isGuestListPageActive ? "page" : undefined}
                onClick={(e) => handleScrollToTopIfCurrentPage('/guest-list', e)}
              >
                <Users className="h-6 w-6" />
                <span className="text-xs mt-1">List</span>
              </a>
            </Link>
          </li>

          {/* 4. Profile Button */}
          <li className="flex-1 h-full">
            <Link href="/profile" passHref legacyBehavior>
              <a 
                className={getItemClasses(isProfilePageActive)}
                aria-label="View Profile"
                aria-current={mounted && isProfilePageActive ? "page" : undefined}
                onClick={(e) => handleScrollToTopIfCurrentPage('/profile', e)}
              >
                <UserCircle2 className="h-6 w-6" />
                <span className="text-xs mt-1">Profile</span>
              </a>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
