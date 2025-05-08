// src/lib/mockData.ts
import type { WorkerStatus, BookingStatus, ServiceItem, TrainingModule } from './constants';
import { serviceCategories } from './constants'; // Removed mockTrainingModules from here
import { format, parseISO, isEqual, startOfDay } from 'date-fns';

let nextWorkerId = 4; 
let nextBookingId = 3;
let nextTrainingModuleId = 5; // For new modules

export interface OnboardingStep {
  id: string;
  label: string;
  completed: boolean;
  notes?: string;
}
export interface AssignedTrainingModule {
  moduleId: string;
  title: string; 
  status: 'Not Started' | 'In Progress' | 'Completed';
  score?: number; 
  completionDate?: string; 
}

export interface MockWorker {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  idNumber: string;
  servicesOffered: string[]; 
  experience: string;
  bankAccountNumber: string;
  bankName: string;
  branchCode: string;
  profilePictureUrl?: string; 
  status: WorkerStatus;
  trainingVerified: boolean; 
  hourlyRate: number; 
  unavailableDates: string[]; 
  onboardingSteps: OnboardingStep[];
  assignedTrainingModules: AssignedTrainingModule[];
}

export interface MockBooking {
  id: string;
  customerId: string; 
  customerName: string; 
  workerId: string;
  workerName: string; 
  serviceItemIds: string[];
  serviceNames: string[]; 
  bookingDate: string; 
  estimatedDurationMinutes: number;
  totalPrice: number;
  status: BookingStatus;
  rating?: number;
  review?: string;
  customerNotes?: string;
  location: { address: string; lat?: number; lng?: number };
  createdAt: string; 
}

// --- Training Modules Data ---
let mockTrainingModulesData: TrainingModule[] = [
  { id: 'train001', title: 'Clean Slate Welcome & Ethics', type: 'Document', description: 'Introduction to company values and code of conduct.', contentUrl: '/docs/ethics_policy.pdf', estimatedDurationMinutes: 30 },
  { id: 'train002', title: 'Basic Cleaning Techniques', type: 'Video', description: 'Demonstrations of standard cleaning procedures.', contentUrl: 'https://www.youtube.com/embed/examplevideo1', estimatedDurationMinutes: 60 },
  { id: 'train003', title: 'Customer Service Excellence', type: 'Mixed', description: 'Handling customer interactions and managing expectations, includes a quiz.', contentUrl: '/training/customer-service', quizId: 'quiz001', estimatedDurationMinutes: 45 },
  { id: 'train004', title: 'Health & Safety Protocols', type: 'Document', description: 'Understanding safety guidelines and use of materials.', contentUrl: '/docs/safety_protocols.pdf', estimatedDurationMinutes: 45 },
];

export const getMockTrainingModules = (): TrainingModule[] => [...mockTrainingModulesData];

export const addMockTrainingModule = (moduleData: Omit<TrainingModule, 'id'>): TrainingModule => {
  const newModule: TrainingModule = {
    ...moduleData,
    id: `train${String(nextTrainingModuleId++).padStart(3, '0')}`,
  };
  mockTrainingModulesData.push(newModule);
  notifyMockDataChanged(); // Notify components that data has changed
  return newModule;
};
export const getMockTrainingModuleById = (id: string): TrainingModule | undefined => {
  return mockTrainingModulesData.find(module => module.id === id);
};


const getDefaultOnboardingSteps = (): OnboardingStep[] => [
  { id: 'idVerification', label: 'ID Verification', completed: false },
  { id: 'addressConfirmation', label: 'Address Confirmation', completed: false },
  { id: 'contractSigning', label: 'Contract Signing', completed: false },
  { id: 'initialTraining', label: 'Initial Training Program', completed: false },
];

let mockWorkers: MockWorker[] = [
  { 
    id: 'worker1', fullName: 'Jane Doe', email: 'jane.doe@example.com', phone: '0821234567', 
    address: '123 Main St, Anytown', idNumber: '9001015000080', servicesOffered: ['essential-tidying', 'laundry-linen'],
    experience: '5 years experience in general home cleaning and laundry services.',
    bankAccountNumber: '1234567890', bankName: 'FNB', branchCode: '250655',
    status: 'Active', trainingVerified: true, hourlyRate: 110, unavailableDates: [],
    onboardingSteps: getDefaultOnboardingSteps().map(s => ({...s, completed: true})), 
    assignedTrainingModules: [
      { moduleId: 'train001', title: getMockTrainingModuleById('train001')?.title || '', status: 'Completed', completionDate: new Date().toISOString() },
      { moduleId: 'train002', title: getMockTrainingModuleById('train002')?.title || '', status: 'Completed', completionDate: new Date().toISOString() },
    ]
  },
  { 
    id: 'worker2', fullName: 'John Smith', email: 'john.smith@example.com', phone: '0731234567',
    address: '456 Oak Ave, Anytown', idNumber: '8503156000085', servicesOffered: ['essential-tidying', 'kitchen-detail', 'deluxe-deep-clean'],
    experience: '10 years experience, specializing in deep cleaning and kitchen details.',
    bankAccountNumber: '0987654321', bankName: 'Capitec', branchCode: '470010',
    status: 'Active', trainingVerified: true, hourlyRate: 125, unavailableDates: [format(new Date(new Date().setDate(new Date().getDate() + 10)), 'yyyy-MM-dd')],
    onboardingSteps: getDefaultOnboardingSteps().map(s => ({...s, completed: true})),
    assignedTrainingModules: [
       { moduleId: 'train001', title: getMockTrainingModuleById('train001')?.title || '', status: 'Completed', completionDate: new Date().toISOString() },
       { moduleId: 'train003', title: getMockTrainingModuleById('train003')?.title || '', status: 'Completed', score: 85, completionDate: new Date().toISOString() },
    ]
  },
   { 
    id: 'worker-pending', fullName: 'Alice Applicant', email: 'pending@example.com', phone: '0810000000',
    address: '789 Pine Rd, Anytown', idNumber: '9512107000081', servicesOffered: ['essential-tidying'],
    experience: 'New applicant, eager to learn.',
    bankAccountNumber: '111222333', bankName: 'Nedbank', branchCode: '198765',
    status: 'PendingApproval', trainingVerified: false, hourlyRate: 100, unavailableDates: [],
    onboardingSteps: getDefaultOnboardingSteps(),
    assignedTrainingModules: []
  },
  { 
    id: 'worker-training', fullName: 'Bob Trainee', email: 'trainee@example.com', phone: '0810000001',
    address: '10 Hillside Cres, Anytown', idNumber: '9207078000088', servicesOffered: ['laundry-linen'],
    experience: 'Completed initial application, ready for training.',
    bankAccountNumber: '444555666', bankName: 'Absa', branchCode: '632005',
    status: 'TrainingPending', trainingVerified: false, hourlyRate: 100, unavailableDates: [],
    onboardingSteps: getDefaultOnboardingSteps().map(s => s.id === 'idVerification' ? {...s, completed: true} : s),
    assignedTrainingModules: [
       { moduleId: 'train001', title: getMockTrainingModuleById('train001')?.title || '', status: 'In Progress' },
       { moduleId: 'train004', title: getMockTrainingModuleById('train004')?.title || '', status: 'Not Started' },
    ]
  },
];

let mockBookings: MockBooking[] = [
  { 
    id: 'booking1', customerId: 'customer1', customerName: 'Valued Customer', workerId: 'worker1', workerName: 'Jane Doe',
    serviceItemIds: ['et-sweep-mop', 'll-wash-dry-fold'], serviceNames: ['Sweep & Mop All Floors', 'Wash, Dry & Fold Laundry (1 load)'],
    bookingDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), 
    estimatedDurationMinutes: 150, totalPrice: (150/60 * 110) + 15 + 25, status: 'ConfirmedByWorker',
    location: { address: 'Customer Address 1, Suburbia' }, createdAt: new Date().toISOString(),
  },
  { 
    id: 'booking2', customerId: 'customer1', customerName: 'Valued Customer', workerId: 'worker2', workerName: 'John Smith',
    serviceItemIds: ['kd-oven-clean', 'ddc-windows-inside'], serviceNames: ['Oven Interior Clean', 'Interior Window Cleaning (reachable)'],
    bookingDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    estimatedDurationMinutes: 150, totalPrice: (150/60 * 125) + 30 + 25, status: 'CompletedByWorker', rating: 5, review: "John did an amazing job! My kitchen is sparkling.",
    location: { address: 'Another Customer Address, Cityville' }, createdAt: new Date().toISOString(),
  },
];

// --- Worker Functions ---
export const getWorkers = (): MockWorker[] => [...mockWorkers];

export const getWorkerById = (id: string): MockWorker | undefined => mockWorkers.find(w => w.id === id);

export const addWorker = (workerData: Omit<MockWorker, 'id' | 'status' | 'trainingVerified' | 'profilePictureUrl' | 'hourlyRate' | 'unavailableDates' | 'onboardingSteps' | 'assignedTrainingModules'>): MockWorker => {
  const newWorker: MockWorker = {
    ...workerData,
    id: `worker${nextWorkerId++}`,
    status: 'PendingApproval', 
    trainingVerified: false,
    profilePictureUrl: undefined,
    hourlyRate: 100, 
    unavailableDates: [],
    onboardingSteps: getDefaultOnboardingSteps(),
    assignedTrainingModules: [],
  };
  mockWorkers.push(newWorker);
  return newWorker;
};

export const updateWorkerStatus = (id: string, status: WorkerStatus, trainingVerifiedUpdate?: boolean): boolean => {
  const workerIndex = mockWorkers.findIndex(w => w.id === id);
  if (workerIndex > -1) {
    mockWorkers[workerIndex].status = status;
    if (trainingVerifiedUpdate !== undefined) {
      mockWorkers[workerIndex].trainingVerified = trainingVerifiedUpdate;
    }
    if (status === 'Active') {
      mockWorkers[workerIndex].trainingVerified = true; 
      mockWorkers[workerIndex].onboardingSteps = mockWorkers[workerIndex].onboardingSteps.map(s => ({...s, completed: true}));
    }
    return true;
  }
  return false;
};

export const updateWorkerOnboardingStep = (workerId: string, stepId: string, completed: boolean, notes?: string): boolean => {
  const workerIndex = mockWorkers.findIndex(w => w.id === workerId);
  if (workerIndex > -1) {
    const stepIndex = mockWorkers[workerIndex].onboardingSteps.findIndex(s => s.id === stepId);
    if (stepIndex > -1) {
      mockWorkers[workerIndex].onboardingSteps[stepIndex].completed = completed;
      if (notes) mockWorkers[workerIndex].onboardingSteps[stepIndex].notes = notes;
      
      const allStepsComplete = mockWorkers[workerIndex].onboardingSteps.every(s => s.completed);
      if (allStepsComplete && mockWorkers[workerIndex].status === 'TrainingPending') {
         mockWorkers[workerIndex].status = 'OnboardingComplete'; 
         mockWorkers[workerIndex].trainingVerified = true; 
      } else if (allStepsComplete && mockWorkers[workerIndex].status === 'PendingApproval') { 
         mockWorkers[workerIndex].status = 'OnboardingComplete';
         mockWorkers[workerIndex].trainingVerified = true;
      }

      notifyMockDataChanged();
      return true;
    }
  }
  return false;
};

export const assignTrainingModuleToWorker = (workerId: string, moduleId: string): boolean => {
  const workerIndex = mockWorkers.findIndex(w => w.id === workerId);
  const module = getMockTrainingModuleById(moduleId);
  if (workerIndex > -1 && module) {
    if (!mockWorkers[workerIndex].assignedTrainingModules.find(atm => atm.moduleId === moduleId)) {
      mockWorkers[workerIndex].assignedTrainingModules.push({ moduleId, title: module.title, status: 'Not Started' });
      notifyMockDataChanged();
      return true;
    }
  }
  return false;
};

export const updateWorkerTrainingModuleStatus = (workerId: string, moduleId: string, status: AssignedTrainingModule['status'], score?: number): boolean => {
  const workerIndex = mockWorkers.findIndex(w => w.id === workerId);
  if (workerIndex > -1) {
    const moduleIndex = mockWorkers[workerIndex].assignedTrainingModules.findIndex(atm => atm.moduleId === moduleId);
    if (moduleIndex > -1) {
      mockWorkers[workerIndex].assignedTrainingModules[moduleIndex].status = status;
      if (status === 'Completed') {
        mockWorkers[workerIndex].assignedTrainingModules[moduleIndex].completionDate = new Date().toISOString();
        if (score !== undefined) mockWorkers[workerIndex].assignedTrainingModules[moduleIndex].score = score;
      }
      
      const initialTrainingModule = mockWorkers[workerIndex].assignedTrainingModules.find(m => m.moduleId === 'train002' || m.moduleId === 'train003'); 
      if (initialTrainingModule?.status === 'Completed') {
          const initialTrainingStepIndex = mockWorkers[workerIndex].onboardingSteps.findIndex(s => s.id === 'initialTraining');
          if (initialTrainingStepIndex > -1) {
              mockWorkers[workerIndex].onboardingSteps[initialTrainingStepIndex].completed = true;
              // Check if this completes overall onboarding
              const allStepsComplete = mockWorkers[workerIndex].onboardingSteps.every(s => s.completed);
              if (allStepsComplete && mockWorkers[workerIndex].status === 'TrainingPending') {
                 mockWorkers[workerIndex].status = 'OnboardingComplete'; 
                 mockWorkers[workerIndex].trainingVerified = true;
              }
          }
      }
      notifyMockDataChanged();
      return true;
    }
  }
  return false;
};


export const updateWorkerAvailability = (workerId: string, unavailableDates: string[]): boolean => {
  const workerIndex = mockWorkers.findIndex(w => w.id === workerId);
  if (workerIndex > -1) {
    mockWorkers[workerIndex].unavailableDates = unavailableDates;
    notifyMockDataChanged();
    return true;
  }
  return false;
};


// --- Booking Functions ---
export const getAllBookings = (): MockBooking[] => [...mockBookings].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const getBookingsForCustomer = (customerId: string): MockBooking[] => 
  mockBookings.filter(b => b.customerId === customerId).sort((a,b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

export const getBookingsForWorker = (workerId: string): MockBooking[] => 
  mockBookings.filter(b => b.workerId === workerId).sort((a,b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

export const getBookingById = (id: string): MockBooking | undefined => mockBookings.find(b => b.id === id);

export const addBooking = (bookingData: Omit<MockBooking, 'id' | 'createdAt' | 'status' | 'serviceNames' | 'workerName' | 'customerName'>): MockBooking => {
  const allServiceItemsFlat = serviceCategories.flatMap(cat => cat.items);
  const serviceNames = bookingData.serviceItemIds.map(id => allServiceItemsFlat.find(item => item.id === id)?.name || 'Unknown Service');
  
  const worker = getWorkerById(bookingData.workerId);
  const workerName = worker ? worker.fullName : 'Unknown Worker';
  const customer = { fullName: 'Valued Customer' }; 

  const newBooking: MockBooking = {
    ...bookingData,
    id: `booking${nextBookingId++}`,
    customerName: customer.fullName, 
    workerName: workerName,
    serviceNames,
    status: 'AwaitingWorkerConfirmation', 
    createdAt: new Date().toISOString(),
  };
  mockBookings.unshift(newBooking); 
  return newBooking;
};

export const updateBookingStatus = (id: string, status: BookingStatus): boolean => {
  const bookingIndex = mockBookings.findIndex(b => b.id === id);
  if (bookingIndex > -1) {
    mockBookings[bookingIndex].status = status;
    if (status === 'CustomerConfirmedAndRated' && mockBookings[bookingIndex].workerId) {
      // Placeholder for updating worker's average rating or completed jobs count
    }
    return true;
  }
  return false;
};

export const addReviewToBooking = (id: string, rating: number, review: string): boolean => {
  const bookingIndex = mockBookings.findIndex(b => b.id === id);
  if (bookingIndex > -1) {
    mockBookings[bookingIndex].rating = rating;
    mockBookings[bookingIndex].review = review;
    mockBookings[bookingIndex].status = 'CustomerConfirmedAndRated';
    return true;
  }
  return false;
};

export const getServiceItemsDetails = (itemIds: string[]): ServiceItem[] => {
  const allItemsMap = new Map<string, ServiceItem>();
  serviceCategories.forEach(category => {
    category.items.forEach(item => {
      allItemsMap.set(item.id, item);
    });
  });
  return itemIds.map(id => allItemsMap.get(id)).filter(item => item !== undefined) as ServiceItem[];
};

export const isWorkerAvailable = (workerId: string, dateTime: string, durationMinutes: number): boolean => {
  const worker = getWorkerById(workerId);
  if (!worker) return false; 

  const requestedStartTime = parseISO(dateTime);
  const requestedDate = startOfDay(requestedStartTime); 

  if (worker.unavailableDates.some(unavailableDateStr => isEqual(startOfDay(parseISO(unavailableDateStr)), requestedDate))) {
    return false; 
  }
  
  const requestedEndTime = new Date(requestedStartTime.getTime() + durationMinutes * 60000);
  const workerBookings = mockBookings.filter(b => 
    b.workerId === workerId && 
    b.status !== 'CancelledByAdmin' && 
    b.status !== 'CancelledByCustomer' && 
    b.status !== 'CancelledByWorker'
  );

  for (const booking of workerBookings) {
    const existingBookingStartTime = parseISO(booking.bookingDate);
    const existingBookingEndTime = new Date(existingBookingStartTime.getTime() + booking.estimatedDurationMinutes * 60000);

    if (requestedStartTime < existingBookingEndTime && requestedEndTime > existingBookingStartTime) {
      return false; 
    }
  }
  return true; 
};


export const MOCK_DATA_CHANGED_EVENT = 'mockDataChanged';
export const notifyMockDataChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(MOCK_DATA_CHANGED_EVENT));
  }
};

