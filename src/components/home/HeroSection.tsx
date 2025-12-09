import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Car, Home, Shield, MapPin, Mic, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 -right-20 w-80 h-80 bg-secondary-blue/20 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-accent/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h40v40H0V0zm1%201v38h38V1H1z%22%20fill%3D%22%23fff%22%20fill-opacity%3D%220.02%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />

      <div className="container mx-auto px-4 pt-28 pb-16 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card mb-8"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground/80">
              AI-Powered Service Platform
            </span>
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold">
              NEW
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-6"
          >
            <span className="text-foreground">From Gadgets</span>
            <br />
            <span className="text-foreground">to Garage to</span>
            <br />
            <span className="text-gradient-primary neon-text">Home</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Verified local help at your fingertips. AI-powered fault diagnosis, 
            real-time tracking, and transparent service history – all in one platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            <Button asChild size="xl" variant="hero" className="group">
              <Link to="/services">
                Book a Service 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="hero-outline">
              <Link to="/signup?role=vendor">
                <Zap className="w-5 h-5" />
                Become a Vendor
              </Link>
            </Button>
          </motion.div>

          {/* Service Categories - 3D Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-20"
          >
            {[
              { 
                icon: Smartphone, 
                label: "Electronics", 
                desc: "Phones, Laptops, Gadgets",
                gradient: "from-primary to-secondary-blue"
              },
              { 
                icon: Car, 
                label: "Mechanical", 
                desc: "Cars, Bikes, Vehicles",
                gradient: "from-accent to-success"
              },
              { 
                icon: Home, 
                label: "Home Services", 
                desc: "Appliances, Plumbing, AC",
                gradient: "from-home-services to-primary"
              },
            ].map(({ icon: Icon, label, desc, gradient }) => (
              <motion.div
                key={label}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link
                  to="/services"
                  className="group glass-card flex flex-col items-center gap-4 p-8 hover:shadow-glow transition-all duration-500"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-semibold text-foreground block">{label}</span>
                    <span className="text-sm text-muted-foreground">{desc}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 text-muted-foreground"
          >
            {[
              { icon: Shield, text: "KYC Verified Vendors" },
              { icon: MapPin, text: "Real-time Tracking" },
              { icon: Mic, text: "Voice Booking" },
              { icon: Sparkles, text: "AI Diagnosis" },
            ].map(({ icon: Icon, text }) => (
              <motion.div
                key={text}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 text-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span>{text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
