import { Brain, MapPin, Shield, Mic, Box, Smartphone } from "lucide-react";

import { useTranslation } from "react-i18next";

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Brain,
      title: t('features.ai_diagnosis_title'),
      description: t('features.ai_diagnosis_desc'),
      color: "bg-primary/10 text-primary",
    },
    {
      icon: MapPin,
      title: t('features.tracking_title'),
      description: t('features.tracking_desc'),
      color: "bg-success/10 text-success",
    },
    {
      icon: Shield,
      title: t('features.blockchain_title'),
      description: t('features.blockchain_desc'),
      color: "bg-accent/10 text-accent",
    },
    {
      icon: Mic,
      title: t('features.voice_title'),
      description: t('features.voice_desc'),
      color: "bg-warning/10 text-warning",
    },
    {
      icon: Box,
      title: t('features.ar_title'),
      description: t('features.ar_desc'),
      color: "bg-electronics/10 text-electronics",
    },
    {
      icon: Smartphone,
      title: t('features.multi_domain_title'),
      description: t('features.multi_domain_desc'),
      color: "bg-destructive/10 text-destructive",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t('features.badge')}
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('features.title_part1')}{" "}
            <span className="text-gradient-primary">{t('features.title_empower')}</span>{" "}
            {t('features.title_part2')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
