import Link from 'next/link';
import SiteLogo from './SiteLogo';
import { Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground border-t">
      <div className="container py-12 px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <SiteLogo />
            <p className="mt-4 text-sm text-muted-foreground">
              Your home, simplified. Quality domestic services at your fingertips.
            </p>
            <div className="mt-6 flex space-x-4">
              <Link href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-6 w-6" />
              </Link>
              <Link href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-6 w-6" />
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:col-span-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Services</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/book?service=cleaning" className="text-sm text-muted-foreground hover:text-primary">Home Cleaning</Link></li>
                <li><Link href="/book?service=laundry" className="text-sm text-muted-foreground hover:text-primary">Laundry & Ironing</Link></li>
                <li><Link href="/services" className="text-sm text-muted-foreground hover:text-primary">All Services</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
                <li><Link href="/careers" className="text-sm text-muted-foreground hover:text-primary">Careers</Link></li>
                <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
                <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Clean Slate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
