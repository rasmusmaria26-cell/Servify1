import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Laptop, Tv, Car, Bike, Truck, Home, Droplets, Zap } from "lucide-react";

const categories = [
  {
    title: "Electronics",
    icon: Smartphone,
    color: "bg-electronics",
    services: [
      { name: "Mobile Repair", icon: Smartphone },
      { name: "Laptop Service", icon: Laptop },
      { name: "TV Repair", icon: Tv },
    ],
  },
  {
    title: "Mechanical",
    icon: Car,
    color: "bg-mechanical",
    services: [
      { name: "Car Service", icon: Car },
      { name: "Bike Repair", icon: Bike },
      { name: "Heavy Vehicles", icon: Truck },
    ],
  },
  {
    title: "Home Services",
    icon: Home,
    color: "bg-home-services",
    services: [
      { name: "Appliance Repair", icon: Home },
      { name: "Plumbing", icon: Droplets },
      { name: "Electrical", icon: Zap },
    ],
  },
];

const ServicesPreview = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Our Services
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              All Services, <span className="text-gradient-primary">One Platform</span>
            </h2>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/services">
              View All Services <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div
              key={category.title}
              className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/20 transition-all duration-300"
            >
              {/* Header */}
              <div className={`${category.color} p-6`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                    <category.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-primary-foreground">
                    {category.title}
                  </h3>
                </div>
              </div>

              {/* Services List */}
              <div className="p-6">
                <ul className="space-y-4">
                  {category.services.map((service) => (
                    <li key={service.name}>
                      <Link
                        to="/services"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors group/item"
                      >
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover/item:bg-primary/10 transition-colors">
                          <service.icon className="w-5 h-5 text-muted-foreground group-hover/item:text-primary transition-colors" />
                        </div>
                        <span className="font-medium text-foreground group-hover/item:text-primary transition-colors">
                          {service.name}
                        </span>
                        <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesPreview;
