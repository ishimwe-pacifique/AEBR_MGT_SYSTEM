import { Button } from '@/components/ui/button'
import { Mail, Shield, Users, Send, CheckCircle2, MessageSquare } from 'lucide-react'
import { translations } from './translations'

const t = translations.contact

export default function ContactSection() {
  return (
    <section id="contact" className="relative py-24 px-4 overflow-hidden bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-900">
      
      {/* Animated Background Orbs for "Awesomeness" */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-green-400/10 blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Content Side */}
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Direct Support
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tighter">
                {t.title}<span className="text-emerald-400">.</span>
              </h2>
              <p className="text-xl text-emerald-100/70 leading-relaxed max-w-xl font-medium">
                {t.subtitle}
              </p>
            </div>

            <div className="grid gap-6">
              {[
                { icon: Users, label: 'Phone', value: t.phone_label, href: 'tel:+250788000000' },
                { icon: Mail, label: 'Email', value: t.email_label, href: 'mailto:support@aebrcms.rw' },
                { icon: Shield, label: 'Office', value: t.office, href: null },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="group flex items-center gap-6 p-4 rounded-2xl transition-all duration-300 hover:bg-white/5 border border-transparent hover:border-white/10">
                  <div className="flex-shrink-0 w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 transition-all duration-300">
                    <Icon className="w-6 h-6 text-emerald-400 group-hover:text-emerald-950" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-500/50 uppercase tracking-wider">{label}</h3>
                    {href ? (
                      <a href={href} className="text-xl font-bold text-white hover:text-emerald-400 transition-colors">{value}</a>
                    ) : (
                      <p className="text-xl font-bold text-white">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Side - Glass Card */}
          <div className="relative group">
            {/* Outer Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-400 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative bg-[#0a1a14]/80 backdrop-blur-2xl rounded-[2rem] p-8 md:p-12 border border-white/10 shadow-2xl">
              <form className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-emerald-100/60 ml-1">{t.name}</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-emerald-100/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white/10 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-emerald-100/60 ml-1">{t.church}</label>
                    <input
                      type="text"
                      placeholder="Church Name"
                      className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-emerald-100/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-emerald-100/60 ml-1">{t.email}</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-emerald-100/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white/10 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-emerald-100/60 ml-1">{t.message}</label>
                  <textarea
                    rows={4}
                    placeholder={t.message}
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-emerald-100/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white/10 transition-all resize-none"
                  />
                </div>

                <Button className="w-full group/btn bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black py-7 rounded-xl transition-all flex items-center justify-center gap-3 text-lg overflow-hidden relative">
                  <span className="relative z-10 flex items-center gap-2">
                    {t.submit}
                    <Send className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-300" />
                </Button>

                <div className="flex items-center justify-center gap-6 pt-4 text-emerald-100/40">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Secure
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 24h Support
                  </div>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}