import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: string; positive: boolean }
  color?: 'green' | 'gold' | 'blue' | 'red'
}

const colorMap = {
  green: 'bg-[#1a3a2a]/10 text-[#1a3a2a]',
  gold: 'bg-[#c9a84c]/10 text-[#c9a84c]',
  blue: 'bg-blue-50 text-blue-600',
  red: 'bg-red-50 text-red-600',
}

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'green' }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm font-medium text-foreground/70 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-foreground/50 mt-1">{subtitle}</p>}
    </div>
  )
}
