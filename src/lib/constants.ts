import type { LucideIcon } from 'lucide-react';
import { Sparkles, ShieldCheck, Users, Briefcase, HelpCircle, WashingMachine, Feather, Bath, Shirt, Layers, BedDouble, ChefHat, SprayCan, Archive, ScanSearch, Eraser, Armchair, CalendarDays, ClipboardCheck, LayoutDashboard, UserCog, ListChecks, UserCircle, Settings, LogOut, Building, UserPlus, FileText, Activity, CalendarCheck, MessageCircle, BarChart3, BookOpen, UserCheck as UserCheckIcon } from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
  matchExact?: boolean;
  roles?: UserRole[]; // For conditional rendering based on user role
};

export type UserRole = 'customer' | 'worker' | 'admin' | 'guest';


export const mainNavItems: NavItem[] = [
  { label: 'Services', href: '/#services', roles: ['guest', 'customer', 'worker', 'admin'] },
  { label: 'How It Works', href: '/#how-it-works', roles: ['guest', 'customer', 'worker', 'admin'] },
  { label: 'Become a Worker', href: '/signup/worker', roles: ['guest'] },
];

export const userDropdownNavItems: NavItem[] = [
  { label: 'My Bookings', href: '/dashboard/customer/bookings', icon: ListChecks, roles: ['customer'] },
  { label: 'My Profile', href: '/dashboard/customer/profile', icon: UserCircle, roles: ['customer'] },
  
  { label: 'My Schedule', href: '/dashboard/worker/bookings', icon: CalendarDays, roles: ['worker'] },
  { label: 'My Availability', href: '/dashboard/worker/availability', icon: CalendarCheck, roles: ['worker'] },
  { label: 'My Profile', href: '/dashboard/worker/profile', icon: UserCircle, roles: ['worker'] },
  { label: 'Earnings', href: '/dashboard/worker/earnings', icon: Activity, roles: ['worker'] }, 

  { label: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['admin'] },
  { label: 'Manage Workers', href: '/admin/workers', icon: Users, roles: ['admin'] },
  { label: 'Manage Bookings', href: '/admin/bookings', icon: ListChecks, roles: ['admin'] },
  { label: 'HR Management', href: '/admin/hr', icon: Building, roles: ['admin'] }, 
  { label: 'Payroll', href: '/admin/payroll', icon: FileText, roles: ['admin'] }, 
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, roles: ['admin'] },
  
  // Common for all logged-in users
  { label: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['customer', 'worker', 'admin'] }, 
];


export type ServiceItem = {
  id: string;
  name: string;
  estimatedTimeMinutes: number;
  materialFee: number; 
  icon?: LucideIcon; 
};

export type ServiceCategory = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  items: ServiceItem[];
  bgColorClass: string; 
  textColorClass: string; 
  dataAiHint: string; 
};

export const WORKER_HOURLY_RATE = 100; // Rands per hour - placeholder

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'essential-tidying',
    name: 'Essential Tidying',
    description: 'Covers the basics to keep your home neat and clean throughout.',
    icon: Sparkles,
    bgColorClass: 'bg-primary/10',
    textColorClass: 'text-primary',
    dataAiHint: 'general cleaning',
    items: [
      { id: 'et-sweep-mop', name: 'Sweep & Mop All Floors', estimatedTimeMinutes: 60, materialFee: 15, icon: Eraser },
      { id: 'et-dusting', name: 'Dust Furniture & Surfaces', estimatedTimeMinutes: 45, materialFee: 5, icon: Feather },
      { id: 'et-dishwashing', name: 'Wash Dishes', estimatedTimeMinutes: 30, materialFee: 5, icon: Layers },
      { id: 'et-bathrooms', name: 'Bathroom Tidy-up (Toilets, Sinks, Mirrors)', estimatedTimeMinutes: 60, materialFee: 20, icon: Bath },
      { id: 'et-trash', name: 'Empty Trash Bins', estimatedTimeMinutes: 15, materialFee: 2, icon: Archive },
    ],
  },
  {
    id: 'laundry-linen',
    name: 'Laundry & Linen Care',
    description: 'Complete laundry service from washing to fresh linens on your bed.',
    icon: WashingMachine,
    bgColorClass: 'bg-blue-500/10',
    textColorClass: 'text-blue-600',
    dataAiHint: 'laundry service',
    items: [
      { id: 'll-wash-dry-fold', name: 'Wash, Dry & Fold Laundry (1 load)', estimatedTimeMinutes: 90, materialFee: 25, icon: WashingMachine },
      { id: 'll-ironing', name: 'Ironing (approx. 10 items)', estimatedTimeMinutes: 60, materialFee: 10, icon: Shirt },
      { id: 'll-change-linens', name: 'Change Bed Linens (per bed)', estimatedTimeMinutes: 15, materialFee: 5, icon: BedDouble },
    ],
  },
  {
    id: 'kitchen-detail',
    name: 'Kitchen Detail Clean',
    description: 'A focused clean for the heart of your home, tackling grime and organization.',
    icon: ChefHat,
    bgColorClass: 'bg-green-500/10',
    textColorClass: 'text-green-600',
    dataAiHint: 'kitchen cleaning',
    items: [
      { id: 'kd-oven-clean', name: 'Oven Interior Clean', estimatedTimeMinutes: 60, materialFee: 30, icon: SprayCan },
      { id: 'kd-fridge-clean', name: 'Refrigerator Interior Clean', estimatedTimeMinutes: 45, materialFee: 20, icon: ChefHat }, // Re-using, find better one if avail
      { id: 'kd-cupboard-fronts', name: 'Wipe Cupboard Exteriors', estimatedTimeMinutes: 30, materialFee: 10, icon: Layers }, // Re-using
      { id: 'kd-microwave', name: 'Microwave Interior/Exterior', estimatedTimeMinutes: 20, materialFee: 5, icon: ScanSearch}, // Placeholder
    ],
  },
  {
    id: 'deluxe-deep-clean',
    name: 'Deluxe Deep Clean Extras',
    description: 'For those times your home needs extra attention to detail for a thorough refresh.',
    icon: ShieldCheck,
    bgColorClass: 'bg-yellow-500/10',
    textColorClass: 'text-yellow-600',
    dataAiHint: 'deep cleaning',
    items: [
      { id: 'ddc-windows-inside', name: 'Interior Window Cleaning (reachable)', estimatedTimeMinutes: 90, materialFee: 25, icon: SprayCan }, // Re-using
      { id: 'ddc-baseboards', name: 'Wipe Down Baseboards', estimatedTimeMinutes: 60, materialFee: 10, icon: Eraser }, // Re-using
      { id: 'ddc-wall-spots', name: 'Spot Clean Walls (minor marks)', estimatedTimeMinutes: 30, materialFee: 10, icon: SprayCan }, // Re-using
      { id: 'ddc-upholstery-vacuum', name: 'Vacuum Upholstery (e.g., sofas)', estimatedTimeMinutes: 45, materialFee: 5, icon: Armchair },
    ],
  },
];


export const howItWorksSteps = [
  {
    id: 1,
    icon: ClipboardCheck, 
    title: "Select Your Services",
    description: "Choose from detailed service categories and items. We calculate the time and cost for you.",
  },
  {
    id: 2,
    icon: UserCog, 
    title: "Get Matched & Quoted",
    description: "Our smart system matches you with a verified local worker and provides a transparent quote.",
  },
  {
    id: 3,
    icon: ShieldCheck, 
    title: "Relax & Enjoy",
    description: "Your Clean Slate professional arrives on time and gets the job done to your satisfaction.",
  },
];

export const workerServiceSpecializations = serviceCategories.map(category => ({
  id: category.id,
  name: category.name,
  icon: category.icon,
  textColorClass: category.textColorClass, 
}));

export const services = serviceCategories.map(category => ({
  id: category.id,
  name: category.name,
  description: category.description,
  icon: category.icon,
  bgColorClass: category.bgColorClass,
  textColorClass: category.textColorClass,
  dataAiHint: category.dataAiHint,
}));

export type WorkerStatus = 
  | 'PendingApplication' 
  | 'PendingApproval' 
  | 'TrainingPending' 
  | 'OnboardingComplete' 
  | 'Active' 
  | 'Suspended' 
  | 'Rejected';

export type BookingStatus = 
  | 'Requested' 
  | 'AwaitingWorkerConfirmation' 
  | 'ConfirmedByWorker' 
  | 'InProgress' 
  | 'CompletedByWorker' 
  | 'CustomerConfirmedAndRated' 
  | 'CancelledByCustomer' 
  | 'CancelledByWorker' 
  | 'CancelledByAdmin';

export interface TrainingModule {
  id: string;
  title: string;
  type: 'Video' | 'Document' | 'Quiz' | 'Mixed';
  description: string;
  contentUrl?: string; 
  quizId?: string; 
  estimatedDurationMinutes: number;
}


export { Sparkles as IconSparkles, ShieldCheck as IconShieldCheck, Users as IconUsers, Briefcase as IconBriefcase, HelpCircle as IconHelpCircle, WashingMachine as IconWashingMachine, Feather as IconFeather, Bath as IconBath, Shirt as IconShirt, Layers as IconLayers, BedDouble as IconBedDouble, ChefHat as IconChefHat, SprayCan as IconSprayCan, Archive as IconArchive, ScanSearch as IconScanSearch, Eraser as IconEraser, Armchair as IconArmchair, UserCog as IconUserCog, ClipboardCheck as IconClipboardCheck, LayoutDashboard as IconLayoutDashboard, ListChecks as IconListChecks, UserCircle as IconUserCircle, Settings as IconSettings, LogOut as IconLogOut, Building as IconBuilding, UserPlus as IconUserPlus, FileText as IconFileText, Activity as IconActivity, CalendarDays as IconCalendarDays, CalendarCheck as IconCalendarCheck, MessageCircle as IconMessageCircle, BarChart3 as IconBarChart3, BookOpen as IconBookOpen, UserCheckIcon };

