// src/app/dashboard/worker/earnings/page.tsx
'use client';

import { useMockAuth } from '@/lib/mockAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Activity, DollarSign, CalendarClock, Download, Frown, Star } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { getBookingsForWorker, type MockBooking } from '@/lib/mockData';

interface EarningSummary {
  currentMonthTotal: number;
  lastMonthTotal: number; // Placeholder, not fully implemented logic
  yearToDateTotal: number;
  averageRating: number | null;
  totalCompletedJobs: number;
  recentPayouts: { date: string; amount: number; status: 'Paid' | 'Pending' }[];
}

function WorkerEarningsPageContent() {
  const { user, isLoading: authLoading } = useMockAuth();
  const [earnings, setEarnings] = useState<EarningSummary | null>(null);
  const [isLoadingEarnings, setIsLoadingEarnings] = useState(true);

  useEffect(() => {
    if (user && user.role === 'worker') {
      setIsLoadingEarnings(true);
      // Simulate fetching earnings data and calculating stats
      setTimeout(() => {
        const workerBookings = getBookingsForWorker(user.id);
        const completedBookings = workerBookings.filter(b => 
          ['CompletedByWorker', 'CustomerConfirmedAndRated'].includes(b.status)
        );

        let currentMonthTotal = 0;
        let yearToDateTotal = 0;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        completedBookings.forEach(b => {
          const bookingDate = new Date(b.bookingDate);
          yearToDateTotal += b.totalPrice; // Simplified: using booking total price as earnings
          if (bookingDate.getFullYear() === currentYear && bookingDate.getMonth() === currentMonth) {
            currentMonthTotal += b.totalPrice;
          }
        });

        const ratedBookings = completedBookings.filter(b => b.rating !== undefined);
        let averageRating: number | null = null;
        if (ratedBookings.length > 0) {
          averageRating = ratedBookings.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedBookings.length;
        }

        setEarnings({
          currentMonthTotal,
          lastMonthTotal: 1870.50, // Placeholder
          yearToDateTotal,
          averageRating,
          totalCompletedJobs: completedBookings.length,
          recentPayouts: [ // Mock payouts
            { date: '2023-10-28', amount: 900.00, status: 'Paid' },
            { date: '2023-11-15', amount: 970.50, status: 'Paid' },
            { date: '2023-11-28', amount: 1250.75, status: 'Pending' },
          ]
        });
        setIsLoadingEarnings(false);
      }, 800);
    } else if (!authLoading && !user) {
        setIsLoadingEarnings(false);
    }
  }, [user, authLoading]);

  if (authLoading || isLoadingEarnings) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>;
  }

  if (!user || user.role !== 'worker' || !earnings) {
     return (
      <div className="container py-12 text-center">
        <Frown className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Earnings Data Not Available</h1>
        <p className="text-muted-foreground mb-6">Please log in as a worker to view your earnings.</p>
        <Button asChild><Link href="/login">Log In</Link></Button>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Activity className="h-9 w-9 text-primary" /> My Earnings & Performance
        </h1>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-md">
            <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1 text-sm"><DollarSign className="h-4 w-4"/>Current Month (Est.)</CardDescription>
                <CardTitle className="text-3xl">R {earnings.currentMonthTotal.toFixed(2)}</CardTitle>
            </CardHeader>
        </Card>
         <Card className="shadow-md">
            <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1 text-sm"><CalendarClock className="h-4 w-4"/>Year to Date</CardDescription>
                <CardTitle className="text-3xl">R {earnings.yearToDateTotal.toFixed(2)}</CardTitle>
            </CardHeader>
        </Card>
        <Card className="shadow-md">
            <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1 text-sm"><Star className="h-4 w-4"/>Average Rating</CardDescription>
                <CardTitle className="text-3xl">
                    {earnings.averageRating ? earnings.averageRating.toFixed(1) + ' / 5' : 'N/A'}
                </CardTitle>
            </CardHeader>
        </Card>
        <Card className="shadow-md">
            <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1 text-sm"><Activity className="h-4 w-4"/>Completed Jobs</CardDescription>
                <CardTitle className="text-3xl">{earnings.totalCompletedJobs}</CardTitle>
            </CardHeader>
        </Card>
      </div>
      
      <Card className="shadow-xl">
        <CardHeader>
            <CardTitle>Recent Payouts / Payslips</CardTitle>
            <CardDescription>View your recent payment history. Actual payout processing is handled by admin.</CardDescription>
        </CardHeader>
        <CardContent>
            {earnings.recentPayouts.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No recent payouts found.</p>
            ) : (
                <ul className="space-y-3">
                    {earnings.recentPayouts.map((payout, index) => (
                        <li key={index} className="flex justify-between items-center p-3 border rounded-md bg-background hover:bg-muted/50">
                            <div>
                                <p className="font-medium">Payout on {payout.date}</p>
                                <p className={`text-xs ${payout.status === 'Paid' ? 'text-green-600' : 'text-orange-500'}`}>{payout.status}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-lg">R {payout.amount.toFixed(2)}</p>
                                <Button variant="link" size="sm" className="p-0 h-auto text-xs"><Download className="inline h-3 w-3 mr-1"/>Download Payslip (Simulated)</Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
             <p className="text-center text-sm text-muted-foreground mt-8">
                This is a placeholder page. Detailed payslips and full payout history will be available.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}


export default function WorkerEarningsPage(){
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>}>
            <WorkerEarningsPageContent/>
        </Suspense>
    )
}

