import { Button } from '@/components/ui/button'
import { Church, MapPin, BarChart3, Shield, ChevronRight, Globe } from 'lucide-react'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aebr-Kacyiru-768x512-hCJClmpbqlYXKFeeMU2oQDSNwK8V9v.jpg"
          alt="AEBR Kacyiru Headquarters"
          className="w-full h-full object-cover"
        />
        {/* Solid Green Overlay (NO transparency blur) */}
        <div className="absolute inset-0 bg-green-900/90" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl">
        <div className="bg-green-800 p-12 rounded-3xl shadow-2xl border border-green-700">
          
          <div className="space-y-4">
            <h1 className="text-[90px] md:text-[140px] font-serif font-black text-white leading-none tracking-tight">
              AEBR
            </h1>
            <p className="text-lg md:text-xl font-medium tracking-widest text-green-100 uppercase">
              Church Management System
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-10">
           <Link href="/login">
  <Button 
    size="lg" 
    className="group h-14 px-10 text-lg bg-white text-green-900 hover:bg-green-100 rounded-full shadow-lg transition-all hover:scale-105"
  >
    Enter Portal
    <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
  </Button>
</Link>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        <div className="absolute top-[15%] left-[8%]">
          <StatCard icon={<Church />} label="200+" sub="Parishes" />
        </div>
        
        <div className="absolute bottom-[15%] left-[10%]">
          <StatCard icon={<MapPin />} label="5" sub="Provinces" />
        </div>

        <div className="absolute top-[18%] right-[8%]">
          <StatCard icon={<BarChart3 />} label="Live" sub="Analytics" />
        </div>

        <div className="absolute bottom-[18%] right-[10%]">
          <StatCard icon={<Shield />} label="Secure" sub="System" />
        </div>
      </div>
    </section>
  )
}

// Solid Stat Card (NO transparency)
function StatCard({ icon, label, sub }: { icon: React.ReactNode, label: string, sub: string }) {
  return (
    <div className="bg-green-800 border border-green-700 p-5 rounded-xl shadow-lg min-w-[150px] flex items-center gap-4">
      <div className="p-2 bg-green-700 rounded-lg text-white">{icon}</div>
      <div className="flex flex-col">
        <span className="text-lg font-bold text-white">{label}</span>
        <span className="text-xs uppercase tracking-widest text-green-200">{sub}</span>
      </div>
    </div>
  )
}