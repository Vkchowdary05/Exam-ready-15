import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/landing/hero-section'
import { StatsSection } from '@/components/landing/stats-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { BadgesSection } from '@/components/landing/badges-section'
import { CTASection } from '@/components/landing/cta-section'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <StatsSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TestimonialsSection />
        <BadgesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
