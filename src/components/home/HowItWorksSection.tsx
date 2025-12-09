import { Search, UserCheck, Wrench, Star } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Describe Your Issue",
    description: "Tell us what's wrong using text, images, or voice. Our AI will analyze and provide an initial diagnosis.",
  },
  {
    number: "02",
    icon: UserCheck,
    title: "Choose Your Expert",
    description: "Browse verified vendors filtered by location, ratings, and price. View profiles and reviews before booking.",
  },
  {
    number: "03",
    icon: Wrench,
    title: "Track in Real-Time",
    description: "Watch your service provider arrive on the live map. Get status updates at every step of the service.",
  },
  {
    number: "04",
    icon: Star,
    title: "Rate & Review",
    description: "After completion, rate your experience. Your feedback helps maintain quality across the platform.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-gradient-surface">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            How <span className="text-gradient-accent">Servify</span> Works
          </h2>
          <p className="text-muted-foreground text-lg">
            Get expert help in just a few simple steps. From booking to completion, 
            we make the entire process seamless and transparent.
          </p>
        </div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-success" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Step Card */}
                <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300 text-center">
                  {/* Number Badge */}
                  <div className="relative z-10 -mt-10 mb-4 flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
                      <step.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                  </div>
                  
                  <span className="inline-block text-5xl font-display font-bold text-muted/30 mb-2">
                    {step.number}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
