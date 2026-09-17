'use client'

import { MaintenanceCard } from '@/components/maintenance/maintenance-card'

export default function MaintenancePage() {
  return (
    <div className="fixed inset-0 z-[100] min-h-screen w-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto font-public-sans">
      <MaintenanceCard />
    </div>
  )
}
