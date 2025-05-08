// src/app/admin/hr/training/page.tsx
'use client';

import { useMockAuth } from '@/lib/mockAuth';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Users, PlusCircle, ListChecks, Frown, Edit, Trash2, Send, Puzzle } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { getMockTrainingModules, type TrainingModule } from '@/lib/mockData'; // Use getMockTrainingModules
import { getWorkers, assignTrainingModuleToWorker, type MockWorker, MOCK_DATA_CHANGED_EVENT } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';


interface TrainingModuleWithStats extends TrainingModule {
    assignments: number;
    completions: number;
}

function TrainingManagementPageContent() {
  const { user, isLoading: authLoading } = useMockAuth();
  const { toast } = useToast();
  const [modulesWithStats, setModulesWithStats] = useState<TrainingModuleWithStats[]>([]);
  const [allWorkers, setAllWorkers] = useState<MockWorker[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedModuleToAssign, setSelectedModuleToAssign] = useState<TrainingModule | null>(null);
  const [selectedWorkerToAssign, setSelectedWorkerToAssign] = useState<string>('');
  const [isLoadingModules, setIsLoadingModules] = useState(true);


  const fetchModulesAndStats = () => {
    setIsLoadingModules(true);
    const currentModules = getMockTrainingModules();
    const workers = getWorkers().filter(w => w.status === 'Active' || w.status === 'TrainingPending');
    setAllWorkers(workers);

    const stats = currentModules.map(module => {
        let assignments = 0;
        let completions = 0;
        workers.forEach(worker => {
            const assigned = worker.assignedTrainingModules.find(atm => atm.moduleId === module.id);
            if(assigned) {
                assignments++;
                if(assigned.status === 'Completed') completions++;
            }
        });
        return { ...module, assignments, completions };
    });
    setModulesWithStats(stats);
    setIsLoadingModules(false);
  };

  useEffect(() => {
    if(user && user.role === 'admin'){
        fetchModulesAndStats();
        
        // Listen for data changes to refresh modules (e.g., after adding a new one)
        const handleDataChange = () => fetchModulesAndStats();
        window.addEventListener(MOCK_DATA_CHANGED_EVENT, handleDataChange);
        return () => {
          window.removeEventListener(MOCK_DATA_CHANGED_EVENT, handleDataChange);
        };
    }
  }, [user, authLoading]);

  const handleOpenAssignModal = (module: TrainingModule) => {
    setSelectedModuleToAssign(module);
    setSelectedWorkerToAssign('');
    setIsAssignModalOpen(true);
  };

  const handleAssignModule = () => {
    if (!selectedModuleToAssign || !selectedWorkerToAssign) {
        toast({ title: "Error", description: "Please select a module and a worker.", variant: "destructive" });
        return;
    }
    const success = assignTrainingModuleToWorker(selectedWorkerToAssign, selectedModuleToAssign.id);
    if (success) {
        toast({ title: "Module Assigned", description: `${selectedModuleToAssign.title} assigned to worker.`});
        fetchModulesAndStats(); // Refresh stats
    } else {
        toast({ title: "Already Assigned", description: "This module may already be assigned to the worker.", variant: "default" });
    }
    setIsAssignModalOpen(false);
  };


  if (authLoading || isLoadingModules) {
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
          <BookOpen className="h-8 w-8 text-primary" /> Training Management
        </h1>
        <div className="flex gap-2">
            <Button asChild>
                <Link href="/admin/hr/training/create">
                     <PlusCircle className="mr-2 h-4 w-4"/> Create New Module
                </Link>
            </Button>
             <Button variant="outline" disabled> {/* Placeholder */}
                <Puzzle className="mr-2 h-4 w-4"/> Manage Quizzes (Future)
            </Button>
        </div>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Training Modules</CardTitle>
          <CardDescription>Manage training materials, assign to workers, and track progress.</CardDescription>
        </CardHeader>
        <CardContent>
          {modulesWithStats.length === 0 ? (
             <p className="text-muted-foreground text-center py-8">No training modules created yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modulesWithStats.map(module => (
                    <Card key={module.id} className="shadow-sm flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{module.title}</CardTitle>
                                <Badge variant="outline" className="text-xs">{module.type}</Badge>
                            </div>
                            <CardDescription className="text-xs line-clamp-2">{module.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground flex-grow">
                            <p><Users className="inline h-4 w-4 mr-1"/>Assigned: {module.assignments}</p>
                            <p><ListChecks className="inline h-4 w-4 mr-1"/>Completions: {module.completions}</p>
                            <p className="text-xs mt-1">Duration: {module.estimatedDurationMinutes} mins</p>
                             {module.quizId && <p className="text-xs mt-1">Quiz ID: {module.quizId}</p>}
                        </CardContent>
                        <CardFooter className="gap-2 mt-auto pt-4 border-t">
                            <Button variant="outline" size="sm" className="flex-1" disabled>
                                <Edit className="mr-1 h-3 w-3"/> Edit
                            </Button>
                            <Button variant="default" size="sm" className="flex-1" onClick={() => handleOpenAssignModal(module)}>
                                <Send className="mr-1 h-3 w-3"/> Assign
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Module Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Assign Training: {selectedModuleToAssign?.title}</DialogTitle>
                <DialogDescription>Select a worker to assign this training module to.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div>
                    <Label htmlFor="worker-select">Worker</Label>
                    <Select value={selectedWorkerToAssign} onValueChange={setSelectedWorkerToAssign}>
                        <SelectTrigger id="worker-select">
                            <SelectValue placeholder="Select a worker" />
                        </SelectTrigger>
                        <SelectContent>
                            {allWorkers.map(worker => (
                                <SelectItem key={worker.id} value={worker.id}>
                                    {worker.fullName} ({worker.email})
                                </SelectItem>
                            ))}
                             {allWorkers.length === 0 && <SelectItem value="" disabled>No eligible workers found</SelectItem>}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
                <Button onClick={handleAssignModule} disabled={!selectedWorkerToAssign}>Assign Module</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default function TrainingManagementPage(){
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>}>
            <TrainingManagementPageContent/>
        </Suspense>
    )
}

