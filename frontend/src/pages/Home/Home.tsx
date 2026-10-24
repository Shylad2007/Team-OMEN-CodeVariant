import React from 'react';
import { HomeNavbar } from '../../components/home/HomeNavbar';
import { TickerMarquee } from '../../components/home/TickerMarquee';
import { Hero } from '../../components/home/Hero';
import { ProblemSection } from '../../components/home/ProblemSection';
import { OutcomesSection } from '../../components/home/OutcomesSection';
import { JourneySection } from '../../components/home/JourneySection';
import { BreakEvenCalculator } from '../../components/home/BreakEvenCalculator';
import { ClosingCta } from '../../components/home/ClosingCta';
import { Footer } from '../../components/home/Footer';
import './Home.css';

export const Home: React.FC = () => {
  const handleScrollToSimulator = () => {
    const el = document.getElementById('simulator');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F4EFE2] text-[#0B0B0B] font-sans selection:bg-[#FFE600] selection:text-[#0B0B0B]">
      <HomeNavbar onScrollToSimulator={handleScrollToSimulator} />
      <TickerMarquee />
      <Hero />
      <ProblemSection />
      <OutcomesSection />
      <JourneySection />
      <BreakEvenCalculator />
      <ClosingCta onScrollToSimulator={handleScrollToSimulator} />
      <Footer />
    </div>
  );
};
