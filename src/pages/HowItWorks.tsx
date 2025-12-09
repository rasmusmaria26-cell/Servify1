import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  UserCheck,
  Wrench,
  Star,
  ArrowRight,
  Smartphone,
  Shield,
  MapPin,
  CreditCard,
  MessageSquare,
  Clock,
} from "lucide-react";

const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    {
      number: "01",
      icon: Search,
      title: t('howItWorksPage.step1_title'),
      description: t('howItWorksPage.step1_desc'),
      details: [
        t('howItWorksPage.step1_detail1'),
        t('howItWorksPage.step1_detail2'),
        t('howItWorksPage.step1_detail3'),
      ],
    },
    {
      number: "02",
      icon: UserCheck,
      title: t('howItWorksPage.step2_title'),
      description: t('howItWorksPage.step2_desc'),
      details: [
        t('howItWorksPage.step2_detail1'),
        t('howItWorksPage.step2_detail2'),
        t('howItWorksPage.step2_detail3'),
      ],
    },
    {
      number: "03",
      icon: Clock,
      title: t('howItWorksPage.step3_title'),
      description: t('howItWorksPage.step3_desc'),
      details: [
        t('howItWorksPage.step3_detail1'),
        t('howItWorksPage.step3_detail2'),
        t('howItWorksPage.step3_detail3'),
      ],
    },
    {
      number: "04",
      icon: Wrench,
      title: t('howItWorksPage.step4_title'),
      description: t('howItWorksPage.step4_desc'),
      details: [
        t('howItWorksPage.step4_detail1'),
        t('howItWorksPage.step4_detail2'),
        t('howItWorksPage.step4_detail3'),
      ],
    },
    {
      number: "05",
      icon: CreditCard,
      title: t('howItWorksPage.step5_title'),
      description: t('howItWorksPage.step5_desc'),
      details: [
        t('howItWorksPage.step5_detail1'),
        t('howItWorksPage.step5_detail2'),
        t('howItWorksPage.step5_detail3'),
      ],
    },
    {
      number: "06",
      icon: Star,
      title: t('howItWorksPage.step6_title'),
      description: t('howItWorksPage.step6_desc'),
      details: [
        t('howItWorksPage.step6_detail1'),
        t('howItWorksPage.step6_detail2'),
        t('howItWorksPage.step6_detail3'),
      ],
    },
  ];

  const features = [
    {
      icon: Shield,
      title: t('howItWorksPage.feature_verified'),
      description: t('howItWorksPage.feature_verified_desc'),
    },
    {
      icon: MapPin,
      title: t('howItWorksPage.feature_tracking'),
      description: t('howItWorksPage.feature_tracking_desc'),
    },
    {
      icon: MessageSquare,
      title: t('howItWorksPage.feature_chat'),
      description: t('howItWorksPage.feature_chat_desc'),
    },
    {
      icon: Smartphone,
      title: t('howItWorksPage.feature_language'),
      description: t('howItWorksPage.feature_language_desc'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24">
        {/* Hero */}
        <section className="bg-gradient-hero text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t('howItWorksPage.title')}
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              {t('howItWorksPage.subtitle')}
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`flex flex-col md:flex-row gap-8 items-start mb-16 ${index % 2 === 1 ? "md:flex-row-reverse" : ""
                    }`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
                      <step.icon className="w-10 h-10 text-primary-foreground" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <span className="text-5xl font-display font-bold text-muted/20">
                      {step.number}
                    </span>
                    <h3 className="font-display text-2xl font-bold text-foreground mb-3 -mt-4">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-gradient-surface">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('howItWorksPage.why_title')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('howItWorksPage.why_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-card rounded-xl p-6 border border-border text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('howItWorksPage.cta_title')}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {t('howItWorksPage.cta_desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="default">
                <Link to="/services">
                  {t('howItWorksPage.cta_book')} <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/signup?role=vendor">{t('howItWorksPage.cta_vendor')}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
