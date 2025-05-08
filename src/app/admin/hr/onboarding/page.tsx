// src/app/admin/hr/onboarding/page.tsx
'use client';

import { useMockAuth } from '@/lib/mockAuth';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UserCheck as UserCheckIcon, CheckSquare, Frown, Users, MoreHorizontal, CheckCircle } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { getWorkers, type MockWorker, type OnboardingStep, updateWorkerStatus, notifyMockDataChanged } from '@/lib/mockData';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import type { WorkerStatus } from '@/lib/constants';

function OnboardingPageContent() {
  const { user, isLoading: authLoading } = useMockAuth();
  const [onboardingWorkers, setOnboardingWorkers] = useState<MockWorker[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightedWorkerId = searchParams.get('workerId');


  const fetchOnboardingWorkers = () => {
    if (user && user.role === 'admin') {
      setIsLoadingData(true);
      setTimeout(() => {
        const allWorkers = getWorkers();
        setOnboardingWorkers(allWorkers.filter(w => ['TrainingPending', 'OnboardingComplete'].includes(w.status)));
        setIsLoadingData(false);
      }, 300);
    } else if (!authLoading && !user) {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchOnboardingWorkers();
  }, [user, authLoading]);

  useEffect(() => {
    const handleDataChange = () => fetchOnboardingWorkers();
    window.addEventListener('mockDataChanged', handleDataChange);
    return () => window.removeEventListener('mockDataChanged', handleDataChange);
  }, []);

  const calculateOnboardingProgress = (steps: OnboardingStep[]): number => {
    if (!steps || steps.length === 0) return 0;
    const completedSteps = steps.filter(step => step.completed).length;
    return (completedSteps / steps.length) * 100;
  };
  
  const handleActivateWorker = (workerId: string) => {
    const success = updateWorkerStatus(workerId, 'Active', true); // Also mark training as verified
    if (success) {
      toast({ title: 'Worker Activated', description: 'Worker is now active and can receive bookings.' });
      fetchOnboardingWorkers();
      notifyMockDataChanged();
    } else {
      toast({ title: 'Error', description: 'Could not activate worker.', variant: 'destructive' });
    }
  };


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

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <UserCheckIcon className="h-8 w-8 text-primary" /> Worker Onboarding Pipeline
        </h1>
        <Button variant="outline" asChild>
            <Link href="/admin/hr/recruitment">View All Applications</Link>
        </Button>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Active Onboarding Workers</CardTitle>
          <CardDescription>Track workers as they complete onboarding steps. Workers in 'TrainingPending' or 'OnboardingComplete' status are shown here.</CardDescription>
        </CardHeader>
        <CardContent>
          {onboardingWorkers.length === 0 ? (
            <div className="text-center py-10 border border-dashed rounded-lg">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl font-medium text-muted-foreground">No workers currently in the onboarding pipeline.</p>
                <p className="text-sm text-muted-foreground mt-1">Approve applicants from the recruitment section to start onboarding.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {onboardingWorkers.map(worker => {
                const progress = calculateOnboardingProgress(worker.onboardingSteps);
                const currentStep = worker.onboardingSteps.find(s => !s.completed)?.label || 'All steps complete';
                return (
                  <Card key={worker.id} className={`shadow-sm hover:shadow-md transition-shadow ${highlightedWorkerId === worker.id ? 'ring-2 ring-primary' : ''}`}>
                     <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{worker.fullName}</CardTitle>
                            <Badge variant={worker.status === 'OnboardingComplete' ? 'default' : 'secondary'}>{worker.status.replace(/([A-Z])/g, ' $1').trim()}</Badge>
                        </div>
                        <CardDescription className="text-xs">Current Stage: {currentStep}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Progress value={progress} className="h-2 mb-2" />
                      <p className="text-xs text-muted-foreground mb-3">{progress.toFixed(0)}% complete</p>
                    </CardContent>
                    <CardFooter className="gap-2 justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/workers/${worker.id}?tab=onboarding`}>Manage Onboarding Steps</Link>
                      </Button>
                       {worker.status === 'OnboardingComplete' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleActivateWorker(worker.id)}>
                           <CheckCircle className="mr-2 h-4 w-4" /> Activate Worker
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function OnboardingPage(){
     return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>}>
            <OnboardingPageContent/>
        </Suspense>
    )
}
