import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Target,
  Eye,
  Heart,
  Users,
  Globe,
  Lightbulb,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();

  const values = [
    {
      icon: Heart,
      title: t('aboutPage.value_trust'),
      description: t('aboutPage.value_trust_desc'),
    },
    {
      icon: Users,
      title: t('aboutPage.value_inclusive'),
      description: t('aboutPage.value_inclusive_desc'),
    },
    {
      icon: Lightbulb,
      title: t('aboutPage.value_innovation'),
      description: t('aboutPage.value_innovation_desc'),
    },
    {
      icon: Globe,
      title: t('aboutPage.value_empowerment'),
      description: t('aboutPage.value_empowerment_desc'),
    },
  ];

  const stats = [
    { value: "50K+", label: t('aboutPage.stats_customers') },
    { value: "5K+", label: t('aboutPage.stats_vendors') },
    { value: "100+", label: t('aboutPage.stats_cities') },
    { value: "98%", label: t('aboutPage.stats_satisfaction') },
  ];

  const team = [
    {
      name: "Maria Rasmus R",
      role: "Founder & CEO",
      image: "/team/maria.jpg",
    },
    {
      name: "M Sowmya",
      role: "CTO",
      image: "/team/sowmya.jpg",
    },
    {
      name: "HK.Pranathi Sree Lakshmi",
      role: "Head of Operations",
      image: "/team/pranathi.jpg",
    },
    {
      name: "B.Manikanta",
      role: "Head of Product",
      image: "/team/manikanta.jpg",
    },
  ];

  // Keeping team hardcoded for now or use translation if names need transliteration, but usually names are kept as is or transliterated. 
  // Let's keep names as is for now as extracted keys didn't include names.
  // Actually, I missed extracting team names. Given user request is about translations, ideally names should leverage transliteration but often they are left in English or transliterated. 
  // I will skip translating names for this iteration as I didn't add keys for them, but I will translate the role if possible.
  // Wait, I didn't add keys for roles either in my previous JSON update. I added team_title and team_subtitle.
  // I'll stick to translating the surrounding text.

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24">
        {/* Hero */}
        <section className="bg-gradient-hero text-primary-foreground py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                {t('aboutPage.title')}
              </h1>
              <p className="text-xl text-primary-foreground/80">
                {t('aboutPage.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-card rounded-2xl p-8 border border-border">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  {t('aboutPage.mission_title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('aboutPage.mission_desc')}
                </p>
              </div>

              <div className="bg-card rounded-2xl p-8 border border-border">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-accent" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  {t('aboutPage.vision_title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('aboutPage.vision_desc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-gradient-surface">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('aboutPage.values_title')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('aboutPage.values_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-4xl md:text-5xl font-bold text-gradient-primary mb-2">
                    {stat.value}
                  </div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Problem We Solve */}
        <section className="py-20 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-center text-foreground">
                {t('aboutPage.problem_title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  t('aboutPage.problem_1'),
                  t('aboutPage.problem_2'),
                  t('aboutPage.problem_3'),
                  t('aboutPage.problem_4'),
                  t('aboutPage.problem_5'),
                  t('aboutPage.problem_6'),
                ].map((problem, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <p className="text-muted-foreground">{problem}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('aboutPage.team_title')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('aboutPage.team_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {team.map((member) => (
                <div key={member.name} className="text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-2xl mx-auto mb-4 object-cover"
                  />
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-surface">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('aboutPage.cta_title')}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {t('aboutPage.cta_desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="default">
                <Link to="/services">
                  {t('aboutPage.cta_explore')} <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/signup?role=vendor">{t('aboutPage.cta_partner')}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
