import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Smartphone,
  Laptop,
  Tv,
  Headphones,
  Car,
  Bike,
  Truck,
  Home,
  Droplets,
  Zap,
  Wind,
  Paintbrush,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Hammer,
} from "lucide-react";
import { fetchAllServices, fetchServiceCategories, Service } from "@/services/serviceService";
import { useToast } from "@/hooks/use-toast";

// Icon mapping
const iconMap: Record<string, any> = {
  Smartphone,
  Laptop,
  Tv,
  Headphones,
  Car,
  Bike,
  Truck,
  Home,
  Droplets,
  Zap,
  Wind,
  Paintbrush,
  Hammer,
};

const categoryColors: Record<string, string> = {
  Electronics: "bg-electronics",
  Vehicles: "bg-mechanical",
  "Home Appliances": "bg-home-services",
  Plumbing: "bg-home-services",
  Electrical: "bg-home-services",
  Carpentry: "bg-home-services",
};

const Services = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [servicesData, categoriesData] = await Promise.all([
        fetchAllServices(),
        fetchServiceCategories(),
      ]);

      setServices(servicesData);
      const categoryNames = ["All", ...categoriesData.map((c: any) => c.name)];
      setCategories(categoryNames);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load services. Please try again.");
      toast({
        title: "Error loading services",
        description: "Unable to fetch services. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || service.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-8">
        {/* Header */}
        <section className="bg-gradient-hero text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Find the Right Service
              </h1>
              <p className="text-primary-foreground/80 text-lg mb-8">
                Browse through our wide range of services and find verified experts near you.
              </p>

              {/* Search Bar */}
              <div className="flex gap-3 max-w-xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-card text-foreground border-0"
                  />
                </div>
                <Button size="lg" className="h-12 gap-2">
                  <Filter className="w-4 h-4" /> Filter
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="border-b border-border sticky top-16 bg-background z-40">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 py-4 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
                    <div className="bg-secondary h-32" />
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-secondary rounded w-1/3" />
                      <div className="h-6 bg-secondary rounded w-2/3" />
                      <div className="h-4 bg-secondary rounded w-full" />
                      <div className="h-8 bg-secondary rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
                <h3 className="font-semibold text-lg mb-2">Failed to Load Services</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadData} variant="outline">
                  Try Again
                </Button>
              </div>
            )}

            {/* Services Grid */}
            {!isLoading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredServices.map((service) => {
                  const IconComponent = service.category?.icon ? iconMap[service.category.icon] || Home : Home;
                  const categoryColor = service.category?.name ? categoryColors[service.category.name] || "bg-secondary" : "bg-secondary";

                  return (
                    <Link
                      key={service.id}
                      to={`/book/${service.id}`}
                      className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/20 hover:shadow-lg transition-all duration-300"
                    >
                      {/* Service Header */}
                      <div className={`${categoryColor} p-6`}>
                        <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                          <IconComponent className="w-7 h-7 text-primary-foreground" />
                        </div>
                      </div>

                      {/* Service Info */}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-secondary rounded-full">
                            {service.category?.name || 'General'}
                          </span>
                        </div>
                        <h3 className="font-display text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                          {service.name}
                        </h3>

                        {service.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {service.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-muted-foreground">Starting from</span>
                            <p className="font-display font-bold text-lg text-foreground">
                              ₹{service.base_price?.toLocaleString() || 'TBD'}
                            </p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {!isLoading && !error && filteredServices.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No services found matching your search.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Services;
