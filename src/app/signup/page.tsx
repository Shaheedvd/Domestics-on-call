import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Briefcase, ArrowRight } from 'lucide-react';
import SiteLogo from '@/components/layout/SiteLogo';

export default function SignupPage() {
  return (
    <div className="container flex min-h-[calc(100vh-var(--header-height)-var(--footer-height))] items-center justify-center py-12 px-4 md:px-6">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center space-y-4">
           <div className="mx-auto">
            <SiteLogo />
          </div>
          <CardTitle className="text-3xl font-bold">Join Clean Slate</CardTitle>
          <CardDescription className="text-muted-foreground">
            Choose your path to a simpler home life or new work opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <Link href="/signup/customer" className="block group">
            <Card className="h-full flex flex-col items-center justify-center p-6 text-center hover:shadow-lg transition-shadow duration-300 hover:border-primary">
              <User className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">I'm a Customer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Book trusted domestic services quickly and easily.
              </p>
              <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                Sign Up as Customer <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          </Link>

          <Link href="/signup/worker" className="block group">
            <Card className="h-full flex flex-col items-center justify-center p-6 text-center hover:shadow-lg transition-shadow duration-300 hover:border-primary">
              <Briefcase className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">I'm a Worker</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Offer your skills, set your schedule, and earn with Clean Slate.
              </p>
              <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                Apply as Worker <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          </Link>
        </CardContent>
        <CardContent className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button variant="link" asChild className="text-primary px-1">
                    <Link href="/login">Log In</Link>
                </Button>
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
