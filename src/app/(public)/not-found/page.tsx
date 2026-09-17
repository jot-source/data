import { DatasetNotFoundCard } from '@/components/not-found/dataset-not-found-card'

export default function NotFoundPage() {
  return (
    <div className="fixed inset-0 z-[100] min-h-screen w-screen bg-[#F5F7FA] flex flex-col items-center justify-end pb-12 sm:justify-center sm:pb-0 p-4 sm:p-6 lg:p-8 overflow-y-auto font-public-sans">
      <DatasetNotFoundCard />
    </div>
  )
}
