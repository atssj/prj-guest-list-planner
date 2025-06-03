
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { BottomNavbar } from '@/components/BottomNavbar';

export const metadata: Metadata = {
  title: 'Shaadi Planner - Wedding Guest List Management',
  description: 'Effortlessly manage your wedding guest lists with Shaadi Planner. Add guests, track preferences, and get summaries for your Indian wedding or any event.',
  keywords: 'shaadi planner, wedding guest list, indian wedding, guest management, event planning, rsvp tracking',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <div className="flex-grow md:pb-0 pb-16"> {/* Adjust padding for bottom navbar */}
          {children}
        </div>
        <Toaster /> {/* Ensure Toaster is here for AuthDialog toasts */}
        <BottomNavbar />
      </body>
    </html>
  );
}
