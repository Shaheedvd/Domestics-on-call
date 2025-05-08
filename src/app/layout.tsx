import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MockAuthProvider } from '@/lib/mockAuth';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Clean Slate - Your Home, Simplified',
  description: 'Book trusted domestic services with Clean Slate. Easy booking, verified workers, transparent pricing.',
  icons: {
    // It's good practice to have a favicon, but we won't generate the actual file here
    // icon: "/favicon.ico", 
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col`}>
        <MockAuthProvider>
          <Header />
          <main className="flex-grow bg-background"> {/* Ensure main also has a default bg */}
            {children}
          </main>
          <Footer />
          <Toaster />
        </MockAuthProvider>
      </body>
    </html>
  );
}
