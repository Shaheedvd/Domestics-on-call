// src/app/admin/workers/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useMockAuth } from '@/lib/mockAuth';
import { getWorkers, updateWorkerStatus, notifyMockDataChanged, type MockWorker } from '@/lib/mockData';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader2, Users, MoreHorizontal, CheckCircle, XCircle, Hourglass, ShieldBan, Eye, Frown } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { WorkerStatus } from '@/lib/constants';

function AdminWorkersPageContent() {
  const { user, isLoading: authLoading } = useMockAuth();
  const [workers, setWorkers] = useState<MockWorker[]>([]);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(true);
  const [filter, setFilter] = useState<WorkerStatus | 'All'>('All');
  const { toast } = useToast();

  const fetchWorkers = () => {
    setIsLoadingWorkers(true);
    // Simulate API call
    setTimeout(() => {
      const allWorkers = getWorkers();
      setWorkers(filter === 'All' ? allWorkers : allWorkers.filter(w => w.status === filter));
      setIsLoadingWorkers(false);
    }, 500);
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchWorkers();
    } else if (!authLoading && !user) {
      setIsLoadingWorkers(false);
    }
  }, [user, authLoading, filter]);

  // Listen for custom event to refetch data
  useEffect(() => {
    const handleDataChange = () => fetchWorkers();
    window.addEventListener('mockDataChanged', handleDataChange);
    return () => {
      window.removeEventListener('mockDataChanged', handleDataChange);
    };
  }, [filter]); // Re-add listener if filter changes, to ensure correct data on change


  const handleUpdateStatus = (workerId: string, newStatus: WorkerStatus) => {
    const success = updateWorkerStatus(workerId, newStatus);
    if (success) {
      toast({ title: 'Worker Status Updated', description: `Worker ${workerId.substring(0,7)}... status changed to ${newStatus}.` });
      fetchWorkers(); // Refetch to show updated status
      notifyMockDataChanged(); // Notify other components
    } else {
      toast({ title: 'Error', description: 'Could not update worker status.', variant: 'destructive' });
    }
  };

  if (authLoading || isLoadingWorkers) {
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
  
  const workerStatuses: (WorkerStatus | 'All')[] = ['All', 'PendingApplication', 'PendingApproval', 'Active', 'Suspended', 'Rejected', 'TrainingPending'];


  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" /> Worker Management
        </h1>
         <Button asChild>
            <Link href="/admin/hr/recruitment">Add New Worker / Applicant</Link>
        </Button>
      </div>
      
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-medium">Filter by status:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">{filter === 'All' ? 'All Statuses' : filter.replace(/([A-Z])/g, ' $1').trim()}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {workerStatuses.map(statusOption => (
              <DropdownMenuItem key={statusOption} onClick={() => setFilter(statusOption)}>
                {statusOption === 'All' ? 'All Statuses' : statusOption.replace(/([A-Z])/g, ' $1').trim()}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>


      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Worker List</CardTitle>
          <CardDescription>Manage and view all registered workers.</CardDescription>
        </CardHeader>
        <CardContent>
          {workers.length === 0 && !isLoadingWorkers ? (
             <div className="text-center py-10 border border-dashed rounded-lg">
              <Frown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl font-medium text-muted-foreground">No workers found for status: "{filter}".</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Training</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={worker.profilePictureUrl || `https://picsum.photos/seed/${worker.id}/100`} alt={worker.fullName} data-ai-hint="person avatar" />
                          <AvatarFallback>{worker.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{worker.fullName}</div>
                          <div className="text-xs text-muted-foreground md:hidden">{worker.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{worker.email}</TableCell>
                    <TableCell className="hidden lg:table-cell">{worker.phone}</TableCell>
                    <TableCell>
                      <Badge variant={worker.status === 'Active' ? 'default' : worker.status === 'Suspended' || worker.status === 'Rejected' ? 'destructive' : 'secondary'}>
                        {worker.status.replace(/([A-Z])/g, ' $1').trim()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {worker.trainingVerified ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Hourglass className="h-5 w-5 text-yellow-600" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions for {worker.fullName.split(' ')[0]}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild><Link href={`/admin/workers/${worker.id}`} className="cursor-pointer"><Eye className="mr-2 h-4 w-4"/>View Details</Link></DropdownMenuItem>
                          {worker.status === 'PendingApproval' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(worker.id, 'Active')} className="text-green-600 focus:text-green-700 cursor-pointer">
                              <CheckCircle className="mr-2 h-4 w-4"/>Approve Application
                            </DropdownMenuItem>
                          )}
                           {worker.status === 'PendingApplication' && ( // If from direct signup, not internal creation
                            <DropdownMenuItem onClick={() => handleUpdateStatus(worker.id, 'PendingApproval')} className="text-blue-600 focus:text-blue-700 cursor-pointer">
                              <Hourglass className="mr-2 h-4 w-4"/>Mark as Reviewing
                            </DropdownMenuItem>
                          )}
                          {worker.status === 'Active' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(worker.id, 'Suspended')} className="text-orange-600 focus:text-orange-700 cursor-pointer">
                              <ShieldBan className="mr-2 h-4 w-4"/>Suspend Worker
                            </DropdownMenuItem>
                          )}
                          {worker.status === 'Suspended' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(worker.id, 'Active')} className="text-green-600 focus:text-green-700 cursor-pointer">
                              <CheckCircle className="mr-2 h-4 w-4"/>Reactivate Worker
                            </DropdownMenuItem>
                          )}
                          {(worker.status === 'PendingApproval' || worker.status === 'PendingApplication') && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(worker.id, 'Rejected')} className="text-red-600 focus:text-red-700 cursor-pointer">
                              <XCircle className="mr-2 h-4 w-4"/>Reject Application
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


export default function AdminWorkersPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>}>
      <AdminWorkersPageContent />
    </Suspense>
  )
}
