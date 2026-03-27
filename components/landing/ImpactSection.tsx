import { translations } from './translations'

const t = translations.impact
const stats = [t.churches, t.provinces, t.security]

export default function ImpactSection() {
  return (
    <section id="impact" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground">{t.title}</h2>
          <p className="text-xl text-foreground/60">{t.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center space-y-4 p-8 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
              <p className="text-5xl sm:text-6xl font-bold text-primary group-hover:scale-110 transition-transform duration-300">
                {stat.number}
              </p>
              <p className="text-lg font-semibold text-foreground/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
