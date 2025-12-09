
import { Search, UserCheck, Wrench, Star } from "lucide-react";

import { useTranslation } from "react-i18next";

const HowItWorksSection = () => {
  const { t } = useTranslation();

  const steps = [
    {
      number: "01",
      icon: Search,
      title: t('howItWorks.step1_title'),
      description: t('howItWorks.step1_desc'),
    },
    {
      number: "02",
      icon: UserCheck,
      title: t('howItWorks.step2_title'),
      description: t('howItWorks.step2_desc'),
    },
    {
      number: "03",
      icon: Wrench,
      title: t('howItWorks.step3_title'),
      description: t('howItWorks.step3_desc'),
    },
    {
      number: "04",
      icon: Star,
      title: t('howItWorks.step4_title'),
      description: t('howItWorks.step4_desc'),
    },
  ];

  return (
    <section className="py-24 bg-gradient-surface">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            {t('howItWorks.badge')}
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('howItWorks.title_part1')}{" "}
            <span className="text-gradient-accent">{t('howItWorks.title_empower')}</span>{" "}
            {t('howItWorks.title_part2')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('howItWorks.subtitle')}
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
