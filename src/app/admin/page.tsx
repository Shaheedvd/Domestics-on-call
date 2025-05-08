// src/app/admin/page.tsx
'use client';

import { useMockAuth } from '@/lib/mockAuth';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, ListChecks, FileText, Building, LayoutDashboard, UserCog, Frown } from 'lucide-react';
import { getAllBookings, getWorkers } from '@/lib/mockData'; // Import mock data functions
import { useEffect, useState } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  link?: string;
  linkText?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description, link, linkText }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
      {link && linkText && (
        <Button variant="link" asChild className="px-0 pt-2 text-sm h-auto">
            <Link href={link}>{linkText} &rarr;</Link>
        </Button>
      )}
    </CardContent>
  </Card>
);


export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useMockAuth();
  const [stats, setStats] = useState({ totalBookings: 0, activeWorkers: 0, pendingApplications: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (user && user.role === 'admin') {
      // Simulate fetching stats
      setTimeout(() => {
        const allBookings = getAllBookings();
        const allWorkers = getWorkers();
        setStats({
          totalBookings: allBookings.length,
          activeWorkers: allWorkers.filter(w => w.status === 'Active').length,
          pendingApplications: allWorkers.filter(w => w.status === 'PendingApplication' || w.status === 'PendingApproval').length,
        });
        setIsLoadingStats(false);
      }, 300);
    } else if (!authLoading && !user) {
        setIsLoadingStats(false);
    }
  }, [user, authLoading]);


  if (authLoading || isLoadingStats) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>;
  }

  if (!user || user.role !== 'admin') {
     return (
      <div className="container py-12 text-center">
        <Frown className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You do not have permission to view this page. Please log in as an administrator.</p>
        <Button asChild><Link href="/login">Log In</Link></Button>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-primary" /> Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Overview of Clean Slate operations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard title="Total Bookings" value={stats.totalBookings} icon={ListChecks} description="All time bookings" link="/admin/bookings" linkText="Manage Bookings"/>
        <StatCard title="Active Workers" value={stats.activeWorkers} icon={Users} description="Verified and active workers" link="/admin/workers" linkText="Manage Workers"/>
        <StatCard title="Pending Applications" value={stats.pendingApplications} icon={UserCog} description="New worker applications" link="/admin/hr/recruitment" linkText="View Applications"/>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><Building className="h-6 w-6 text-primary"/> HR Management</CardTitle>
            <CardDescription>Recruitment, onboarding, and training.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
             <Button variant="outline" asChild className="w-full justify-start"><Link href="/admin/hr/recruitment"><UserCog className="mr-2 h-4 w-4"/> Recruitment</Link></Button>
             <Button variant="outline" asChild className="w-full justify-start"><Link href="/admin/hr/onboarding"><Users className="mr-2 h-4 w-4"/> Onboarding</Link></Button>
             <Button variant="outline" asChild className="w-full justify-start"><Link href="/admin/hr/training"><ListChecks className="mr-2 h-4 w-4"/> Training</Link></Button>
          </CardContent>
        </Card>
         <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><FileText className="h-6 w-6 text-primary"/> Payroll</CardTitle>
            <CardDescription>Manage worker payments and generate payslips.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full justify-start"><Link href="/admin/payroll"><FileText className="mr-2 h-4 w-4"/> Go to Payroll System</Link></Button>
          </CardContent>
        </Card>
         <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><ListChecks className="h-6 w-6 text-primary"/> Bookings Overview</CardTitle>
            <CardDescription>View all customer bookings and their statuses.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full justify-start"><Link href="/admin/bookings"><ListChecks className="mr-2 h-4 w-4"/> Manage All Bookings</Link></Button>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
