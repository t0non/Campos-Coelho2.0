import { Building2, Boxes, Headset, Truck } from 'lucide-react'
import type { BenefitItem } from '@/lib/mocks/mock-benefits'

interface BenefitsBarProps {
  benefits: BenefitItem[]
}

const iconMap = { Building2, Boxes, Headset, Truck }

export function BenefitsBar({ benefits }: BenefitsBarProps) {
  return (
    <section className="bg-white border-b border-gray-200 py-4 select-none">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0 sm:divide-x divide-gray-200">
          {benefits.map((benefit) => {
            const Icon = iconMap[benefit.iconName as keyof typeof iconMap] ?? Building2
            return (
              <div
                key={benefit.id}
                className="flex items-center justify-center gap-3.5 py-2 px-6 sm:px-8 md:px-12 text-left"
              >
                <div className="w-10 h-10 shrink-0 rounded-full bg-[#fff3ee] flex items-center justify-center shadow-2xs">
                  <Icon className="h-5 w-5 text-[#555555]" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">{benefit.title}</h3>
                  <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{benefit.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
