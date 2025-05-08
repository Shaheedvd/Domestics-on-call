'use client';

import Link from 'next/link';
import { useState, useEffect, Fragment } from 'react';
import { Menu, X, UserCircle as UserIcon, LogOut,ChevronDown, LayoutDashboard } from 'lucide-react'; // Added ChevronDown, LayoutDashboard
import SiteLogo from './SiteLogo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { mainNavItems, userDropdownNavItems, type NavItem, type UserRole } from '@/lib/constants';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useMockAuth } from '@/lib/mockAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";


export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const { user, logout, isLoading } = useMockAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  
  const NavLinks = ({ onItemClick, role }: { onItemClick?: () => void; role: UserRole }) => (
    <>
      {mainNavItems.filter(item => !item.roles || item.roles.includes(role)).map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onItemClick}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            (item.matchExact ? pathname === item.href : pathname.startsWith(item.href)) && item.href !== '/' || (item.href === '/' && pathname === '/')
              ? "text-primary" 
              : "text-muted-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </>
  );

  const UserSpecificNavLinks = ({ onItemClick, role }: { onItemClick?: () => void; role: UserRole }) => (
     userDropdownNavItems
      .filter(item => item.roles?.includes(role))
      .map((item) => (
      <DropdownMenuItem key={item.href} asChild onClick={onItemClick} className="cursor-pointer">
        <Link href={item.href} className="flex items-center gap-2 w-full">
          {item.icon && <item.icon className="h-4 w-4" />}
          {item.label}
        </Link>
      </DropdownMenuItem>
    ))
  );
  
  // Dev utility to quickly switch users
  const LoginAsRoleButtons = () => {
    if (process.env.NODE_ENV !== 'development' || isLoading || user) return null;
    const roles: UserRole[] = ['customer', 'worker', 'admin'];
    return (
      <div className="absolute top-16 right-4 bg-slate-700 p-1 rounded shadow-lg z-[1000] text-xs space-y-1">
        <p className="text-white text-center font-bold">Dev: Login As</p>
        {roles.map(role => (
           <Button key={role} size="sm" variant="outline" className="w-full h-6 text-xs" onClick={() => (window as any).mockLoginAs(role)}>
             {role.charAt(0).toUpperCase() + role.slice(1)}
           </Button>
        ))}
      </div>
    );
  };


  if (!isMounted || isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <SiteLogo />
           <div className="flex items-center gap-2">
            <div className="w-20 h-9 rounded-md animate-pulse bg-muted" /> {/* Placeholder for login button */}
            <div className="w-24 h-9 rounded-md animate-pulse bg-muted" /> {/* Placeholder for Book Now button */}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <SiteLogo />
        <nav className="hidden md:flex items-center gap-6">
          <NavLinks role={user?.role || 'guest'} />
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">{user.fullName}</span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account ({user.role})</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                 { user.role === 'admin' && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/admin" className="flex items-center gap-2 w-full">
                        <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <UserSpecificNavLinks role={user.role}/>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" asChild className="hidden md:inline-flex">
              <Link href="/login">Login</Link>
            </Button>
          )}

          {(!user || user.role === 'customer' || user.role === 'guest') && (
            <Button asChild>
              <Link href="/book">Book Now</Link>
            </Button>
          )}
          
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                   <SiteLogo />
                  <Button variant="ghost" size="icon" onClick={closeMobileMenu}>
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </div>
                <nav className="flex flex-col gap-4 mb-auto">
                  <NavLinks onItemClick={closeMobileMenu} role={user?.role || 'guest'} />
                  {user && (
                    <>
                      <hr className="my-2"/>
                      <p className="text-sm font-medium text-muted-foreground px-2">My Account</p>
                      { user.role === 'admin' && (
                        <Link href="/admin" onClick={closeMobileMenu} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-2 px-2 py-1.5">
                           <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                        </Link>
                       )}
                      <UserSpecificNavLinks onItemClick={closeMobileMenu} role={user.role} />
                    </>
                  )}
                </nav>
                <div className="mt-auto">
                  {user ? (
                     <Button variant="outline" className="w-full" onClick={() => { logout(); closeMobileMenu(); }}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log Out
                      </Button>
                  ) : (
                    <Button variant="outline" asChild className="w-full" onClick={closeMobileMenu}>
                      <Link href="/login">Login</Link>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <LoginAsRoleButtons /> {/* Dev utility */}
    </header>
  );
}
