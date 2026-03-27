import { Card } from '@/components/ui/card'
import { Users, TrendingUp, Shield, BarChart3, ArrowRight } from 'lucide-react'
import { translations } from './translations'

const t = translations.pillars

const pillars = [
  { icon: Users, key: 'membership' },
  { icon: TrendingUp, key: 'financial' },
  { icon: Shield, key: 'ministry' },
  { icon: BarChart3, key: 'analytics' },
] as const

export default function PillarsSection() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30 relative">
      {/* Structural Divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto">
        {/* Centered Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-5">
     
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground">
            Core Pillars
          </h2>
          <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
          <p className="text-xl text-muted-foreground leading-relaxed">
            Comprehensive solutions for modern church management
          </p>
        </div>

        {/* Professional Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map(({ icon: Icon, key }) => (
            <Card 
              key={key} 
              className="group relative p-8 bg-card border border-border/60 hover:border-primary/50 rounded-2xl transition-all duration-500 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-1"
            >
              <div className="flex flex-col h-full space-y-6">
                {/* Minimalist Icon Box */}
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/30">
                  <Icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>

                <div className="space-y-3 flex-grow">
                  <h3 className="text-2xl font-bold text-foreground tracking-tight">
                    {t[key].name}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors">
                    {t[key].desc}
                  </p>
                </div>

                {/* Subtle Action Indicator */}
                <div className="pt-4 flex items-center text-sm font-semibold text-primary overflow-hidden">
                  <span className="translate-y-[120%] group-hover:translate-y-0 transition-transform duration-300">
                    Explore Feature
                  </span>
                  <ArrowRight className="ml-2 w-4 h-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}