import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import PillarsSection from '@/components/landing/PillarsSection'
import ImpactSection from '@/components/landing/ImpactSection'
import ContactSection from '@/components/landing/ContactSection'
import Footer from '@/components/landing/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <PillarsSection />
      <ImpactSection />
      <ContactSection />
      <Footer />
    </div>
  )
}
