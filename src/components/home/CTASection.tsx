import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus, Briefcase } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer CTA */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mb-6">
                <UserPlus className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                Need a Service?
              </h3>
              <p className="text-primary-foreground/80 mb-8 max-w-md">
                Sign up as a customer and get access to thousands of verified service
                providers. Book instantly, track in real-time, and pay securely.
              </p>
              <Button asChild size="lg" variant="hero">
                <Link to="/signup">
                  Get Started <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Vendor CTA */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-accent p-10 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-foreground/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-accent-foreground/20 flex items-center justify-center mb-6">
                <Briefcase className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-accent-foreground mb-4">
                Are You a Service Provider?
              </h3>
              <p className="text-accent-foreground/80 mb-8 max-w-md">
                Join our network of verified vendors. Get more customers, manage bookings
                easily, and grow your business with our tools.
              </p>
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link to="/signup?role=vendor">
                  Join as Vendor <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
