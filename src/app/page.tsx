import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { serviceCategories, howItWorksSteps } from '@/lib/constants'; // Updated to serviceCategories
import { CheckCircle, Sparkles as AiSparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 lg:py-32 bg-secondary">
        <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Trusted Domestic Services, <span className="text-primary">Simplified</span>.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Reclaim your time with Clean Slate. Easily book verified and reliable domestic workers for cleaning, laundry, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/book">Book a Service</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/#services">Explore Services</Link>
              </Button>
            </div>
          </div>
          <div>
            <Image
              src="https://picsum.photos/seed/cleanslate-hero/600/400"
              alt="Happy person in a clean home"
              width={600}
              height={400}
              className="rounded-lg shadow-xl object-cover"
              data-ai-hint="clean living room"
              priority
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Our Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from a range of professional home service categories tailored to your needs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8"> {/* Adjusted grid for potentially wider category cards */}
            {serviceCategories.map((category) => (
              <Card key={category.id} className={`flex flex-col ${category.bgColorClass} border-0 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                <CardHeader className="flex flex-row items-center gap-4 p-6">
                  <category.icon className={`h-10 w-10 ${category.textColorClass}`} />
                  <CardTitle className={`text-2xl ${category.textColorClass}`}>{category.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-6 pt-0">
                  <CardDescription className="text-muted-foreground mb-4">{category.description}</CardDescription>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-6">
                    {category.items.slice(0, 3).map(item => <li key={item.id}>{item.name}</li>)}
                    {category.items.length > 3 && <li>And more...</li>}
                  </ul>
                  <Button variant="link" asChild className={`p-0 ${category.textColorClass} hover:${category.textColorClass}/80`}>
                    {/* Link to general booking page, specific category pre-selection can be added later */}
                    <Link href="/book">Book Services &rarr;</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How Clean Slate Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting your home tasks done is as easy as 1-2-3.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step) => (
              <Card key={step.id} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-semibold">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <p className="text-muted-foreground">{step.description.replace('HomeEase', 'Clean Slate')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Smart Matching Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
           <div>
            <Image
              src="https://picsum.photos/seed/smart-match/600/450"
              alt="AI powered matching illustration"
              width={600}
              height={450}
              className="rounded-lg shadow-xl object-cover"
              data-ai-hint="network connection"
            />
          </div>
          <div className="space-y-6">
            <div className="inline-block rounded-lg bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
              <AiSparkles className="inline-block w-4 h-4 mr-1" />
              AI-Powered
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Smart Matching Technology</h2>
            <p className="text-lg text-muted-foreground">
              Our intelligent system connects you with the perfect worker based on your specific needs, location, and their skills. This ensures quality service and efficient scheduling.
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Optimized for your location and requirements.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Considers worker skills and availability.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Faster booking confirmations.
              </li>
            </ul>
            <Button variant="outline" asChild>
              <Link href="/learn-more/smart-matching">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>


      {/* Call to Action Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Ready to Simplify Your Home Life?</h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and dedicated workers on Clean Slate.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/book">Book a Service Today</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link href="/signup/worker">Become a Worker</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
