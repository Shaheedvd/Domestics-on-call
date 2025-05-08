// src/app/admin/hr/page.tsx
'use client';

import { useMockAuth } from '@/lib/mockAuth';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, UserPlus, UserCheck, BookOpen, Building, Frown } from 'lucide-react';
import { Suspense } from 'react';

function HRDashboardPageContent() {
  const { user, isLoading: authLoading } = useMockAuth();

  if (authLoading) {
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

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Building className="h-8 w-8 text-primary" /> Human Resources Dashboard
        </h1>
        <p className="text-muted-foreground">Manage your workforce: recruitment, onboarding, training, and worker profiles.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/hr/recruitment" className="block group">
            <Card className="shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl"><UserPlus className="h-6 w-6 text-primary"/> Recruitment</CardTitle>
                    <CardDescription>Manage applications and new worker intake.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">View pending applications, schedule interviews, and manage applicant statuses.</p>
                </CardContent>
                <CardContent>
                     <Button variant="outline" className="w-full group-hover:bg-primary/10">Go to Recruitment &rarr;</Button>
                </CardContent>
            </Card>
        </Link>

        <Link href="/admin/hr/onboarding" className="block group">
            <Card className="shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl"><UserCheck className="h-6 w-6 text-primary"/> Onboarding</CardTitle>
                    <CardDescription>Track new hires through the onboarding process.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">Monitor ID verification, contract signing, and initial training completion for new workers.</p>
                </CardContent>
                 <CardContent>
                     <Button variant="outline" className="w-full group-hover:bg-primary/10">Go to Onboarding &rarr;</Button>
                </CardContent>
            </Card>
        </Link>

        <Link href="/admin/hr/training" className="block group">
            <Card className="shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl"><BookOpen className="h-6 w-6 text-primary"/> Training Management</CardTitle>
                    <CardDescription>Develop and assign training to your workforce.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">Create training modules, assign them to workers, and track their progress and certifications.</p>
                </CardContent>
                 <CardContent>
                     <Button variant="outline" className="w-full group-hover:bg-primary/10">Go to Training &rarr;</Button>
                </CardContent>
            </Card>
        </Link>
        
        <Link href="/admin/workers" className="block group md:col-span-1 lg:col-span-3">
            <Card className="shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl"><Users className="h-6 w-6 text-primary"/> All Worker Profiles</CardTitle>
                    <CardDescription>View and manage all worker profiles, statuses, and performance.</CardDescription>
                </CardHeader>
                 <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">Access detailed profiles for all workers, including their HR information, booking history, and performance reviews.</p>
                </CardContent>
                 <CardContent>
                     <Button variant="outline" className="w-full group-hover:bg-primary/10">Manage All Workers &rarr;</Button>
                </CardContent>
            </Card>
        </Link>
      </div>
    </div>
  );
}

export default function HRDashboardPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>}>
      <HRDashboardPageContent />
    </Suspense>
  );
}
