import { Button } from '@/components/ui/button'

export default function CtaSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-4xl sm:text-5xl font-bold text-balance">
          Ready to Transform Your Church?
        </h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          Join 200+ churches across Rwanda using AEBR CMS to streamline administration and focus on what matters most—serving your community.
        </p>
        <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 rounded-lg transition-all hover:shadow-lg">
          Start Your Free Trial
        </Button>
      </div>
    </section>
  )
}
