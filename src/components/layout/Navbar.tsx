import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, X, Wrench, ChevronDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate(); // Added navigate

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: t('navbar.services'), path: "/services" },
    { name: t('navbar.howItWorks'), path: "/how-it-works" },
    { name: t('navbar.about'), path: "/about" },
  ];

  // Determine dashboard link based on role
  // Note: Role is stored in user_metadata or requires a separate fetch. 
  // For now, we'll try to guess or just have a generic dashboard link that redirects.
  // Ideally, we store role in metadata on signup.
  const dashboardLink = user?.user_metadata?.role === 'vendor'
    ? '/vendor/dashboard'
    : user?.user_metadata?.role === 'admin'
      ? '/admin/dashboard'
      : '/customer/dashboard';

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg"
        : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow"
            >
              <Wrench className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-display text-2xl font-bold text-foreground">
                Servify
              </span>
              <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
                2025 Edition
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isActive(link.path)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-2 pr-4 h-10 rounded-full border border-border bg-card/50 hover:bg-card">
                    <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-[10px] text-white font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium max-w-[100px] truncate">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-card border-border/50">
                  <DropdownMenuItem asChild>
                    <Link to={dashboardLink} className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    {/* Settings is usually inside dashboard, but we can have it here if we had a dedicated settings page */}
                    <Link to={`${dashboardLink}?tab=settings`} className="cursor-pointer">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-1 text-muted-foreground hover:text-foreground">
                      {t('navbar.login')} <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 glass-card border-border/50">
                    <DropdownMenuItem asChild>
                      <Link to="/login/customer" className="w-full cursor-pointer">
                        {t('navbar.customer')} {t('navbar.login')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/login/vendor" className="w-full cursor-pointer">
                        {t('navbar.vendor')} {t('navbar.login')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/login/admin" className="w-full cursor-pointer">
                        {t('navbar.admin')} {t('navbar.login')}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button asChild variant="hero" size="default">
                  <Link to="/signup" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {t('navbar.getStarted')}
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="md:hidden p-3 rounded-xl glass-card"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden bg-background/95 backdrop-blur-md border-b border-border shadow-2xl absolute top-20 left-0 right-0 z-40"
            >
              <div className="py-4 space-y-2 container mx-auto px-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive(link.path)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

                <div className="h-px bg-border/50 my-4" />

                {user ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Link
                        to={dashboardLink}
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-secondary/50"
                      >
                        Dashboard
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10"
                      >
                        Log Out
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Link
                        to="/login/customer"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      >
                        {t('navbar.customer')} {t('navbar.login')}
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Link
                        to="/login/vendor"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      >
                        {t('navbar.vendor')} {t('navbar.login')}
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Link
                        to="/login/admin"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      >
                        {t('navbar.admin')} {t('navbar.login')}
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="pt-2"
                    >
                      <Button asChild className="w-full" variant="hero">
                        <Link to="/signup" onClick={() => setIsOpen(false)}>
                          <Sparkles className="w-4 h-4" />
                          {t('navbar.getStarted')}
                        </Link>
                      </Button>
                    </motion.div>
                  </>
                )}

                <div className="px-4 py-2 border-t border-border/50 mt-2 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Language</span>
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
