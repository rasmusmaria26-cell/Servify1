import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Wrench, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-card border-t border-border text-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center">
                <Wrench className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-display text-xl font-bold">Servify</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {t('footer.desc')}
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">{t('footer.services')}</h4>
            <ul className="space-y-3">
              {[
                t('services.electronics_desc'),
                t('services.mechanical'),
                t('services.home'),
                t('services.electronics'), // Using existing keys for now
                t('services.home_desc')
              ].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to="/services"
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">{t('footer.company')}</h4>
            <ul className="space-y-3">
              {[
                { name: t('navbar.about'), path: "/about" },
                { name: t('navbar.howItWorks'), path: "/how-it-works" },
                { name: t('hero.cta_vendor'), path: "/signup?role=vendor" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent mt-0.5" />
                <span className="text-muted-foreground text-sm">
                  Kalasalingam Academy of Research and Education,
                  <br />
                  Krishnankoil, Srivilliputhur,
                  <br />
                  Tamil Nadu 626126
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent" />
                <a
                  href="tel:+917010379334"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  +91 7010379334
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent" />
                <a
                  href="mailto:servify@gmail.com"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  servify@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Servify. {t('footer.allRightsReserved')}
          </p>
          <div className="flex gap-6">
            {[t('footer.privacy'), t('footer.terms'), t('footer.cookies')].map((item) => (
              <Link
                key={item}
                to="#"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
