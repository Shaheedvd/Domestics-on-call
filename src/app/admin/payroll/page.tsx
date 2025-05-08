// src/app/admin/payroll/page.tsx
'use client';

import { useMockAuth } from '@/lib/mockAuth';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, CalendarClock, Mail, Download, ListFilter, Frown, Users, DollarSign } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { getWorkers, getBookingsForWorker, type MockWorker, type MockBooking } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface WorkerPayoutInfo extends MockWorker {
  estimatedPayout: number;
  completedJobsThisPeriod: number;
}

function PayrollPageContent() {
  const { user, isLoading: authLoading } = useMockAuth();
  const [workerPayouts, setWorkerPayouts] = useState<WorkerPayoutInfo[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Placeholder data for payroll runs - in real app this would be more complex
  const payrollRuns = [
    { id: 'pr1', period: 'October 2023', status: 'Paid', totalAmount: 15600.50, workersPaid: 12 },
    { id: 'pr2', period: 'November 2023', status: 'Pending', totalAmount: 0, workersPaid: 0 }, // Total will be calculated from workerPayouts
  ];
  
  const currentPayrollRun = payrollRuns.find(pr => pr.status === 'Pending');


  useEffect(() => {
    if (user && user.role === 'admin') {
      setIsLoadingData(true);
      setTimeout(() => { // Simulate data fetching
        const allWorkers = getWorkers().filter(w => w.status === 'Active');
        const payouts: WorkerPayoutInfo[] = allWorkers.map(worker => {
          const bookings = getBookingsForWorker(worker.id);
          // Simplified: considering all 'CompletedByWorker' or 'CustomerConfirmedAndRated' bookings for current pending payroll.
          // In a real system, this would filter by date range of the payroll period.
          const relevantBookings = bookings.filter(b => 
            ['CompletedByWorker', 'CustomerConfirmedAndRated'].includes(b.status)
            // && b.payrollProcessed !== true // Add a flag to bookings if they've been paid out
          );
          const estimatedPayout = relevantBookings.reduce((sum, b) => sum + b.totalPrice, 0); // Simplified - should be worker's share
          return {
            ...worker,
            estimatedPayout,
            completedJobsThisPeriod: relevantBookings.length,
          };
        });
        setWorkerPayouts(payouts);
        setIsLoadingData(false);
      }, 500);
    } else if (!authLoading && !user) {
        setIsLoadingData(false);
    }
  }, [user, authLoading]);


  if (authLoading || isLoadingData) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>;
  }

  if (!user || user.role !== 'admin') {
     return (
      <div className="container py-12 text-center">
        <Frown className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You do not have permission to view this page.</p>
        <Button asChild><Link href="/login">Log In</Link></Button>
      </div>
    );
  }
  
  const totalPendingPayout = workerPayouts.reduce((sum, wp) => sum + wp.estimatedPayout, 0);
  if (currentPayrollRun) currentPayrollRun.totalAmount = totalPendingPayout;


  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" /> Payroll Management
        </h1>
        <Button disabled> {/* Feature to be implemented */}
            <CalendarClock className="mr-2 h-4 w-4"/> Start New Payroll Run
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Current Payroll Run: {currentPayrollRun?.period || "N/A"}</CardTitle>
              <CardDescription>Review estimated payouts for active workers for the current period. Final calculations may include bonuses/deductions.</CardDescription>
            </CardHeader>
            <CardContent>
              {workerPayouts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No active workers with completed jobs found for the current period.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker</TableHead>
                      <TableHead className="text-center">Completed Jobs</TableHead>
                      <TableHead className="text-right">Est. Payout</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workerPayouts.map(wp => (
                      <TableRow key={wp.id}>
                        <TableCell>{wp.fullName}</TableCell>
                        <TableCell className="text-center">{wp.completedJobsThisPeriod}</TableCell>
                        <TableCell className="text-right">R {wp.estimatedPayout.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/workers/${wp.id}?tab=payroll`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="justify-between items-center">
                <p className="text-sm text-muted-foreground">Total Estimated Payout: <span className="font-semibold text-lg">R {totalPendingPayout.toFixed(2)}</span></p>
                <Button disabled>Process Payments (Future)</Button>
            </CardFooter>
          </Card>
        </div>
        <div>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Payroll History</CardTitle>
              <CardDescription>Past payroll runs.</CardDescription>
            </CardHeader>
            <CardContent>
              {payrollRuns.filter(pr => pr.status === 'Paid').length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No paid payroll runs yet.</p>
              ) : (
                 <div className="space-y-3">
                    {payrollRuns.filter(pr => pr.status === 'Paid').map(run => (
                        <Card key={run.id} className="bg-muted/30">
                            <CardHeader className="pb-2 pt-4 px-4">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-md">Payroll for {run.period}</CardTitle>
                                    <Badge variant='default'>{run.status}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="text-xs text-muted-foreground px-4 pb-3">
                                <p>Total Paid: R {run.totalAmount.toFixed(2)}</p>
                                <p>Workers: {run.workersPaid}</p>
                            </CardContent>
                            <CardFooter className="px-4 pb-3 gap-2">
                                <Button variant="outline" size="xs" disabled>View Details</Button>
                                <Button variant="ghost" size="xs" disabled><Download className="mr-1 h-3 w-3"/> Export</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
           <p className="text-center text-xs text-muted-foreground mt-6 px-2">
            Full payroll calculation, payslip generation, and payment tracking will be implemented. Current view is based on simplified mock data.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PayrollPage(){
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>}>
            <PayrollPageContent/>
        </Suspense>
    )
}

