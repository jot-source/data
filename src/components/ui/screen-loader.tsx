'use client'

interface ScreenLoaderProps {
  label?: string
  fullScreen?: boolean
}

export function ScreenLoader({
  label = 'Loading your marketplace',
  fullScreen = true,
}: ScreenLoaderProps) {
  return (
    <div
      className={`font-public-sans flex flex-col items-center justify-center text-center ${
        fullScreen
          ? 'fixed inset-0 z-[100] min-h-screen w-screen bg-[#F5F7FA] p-4 overflow-y-auto'
          : 'w-full max-w-[1200px] min-h-[240px] py-12 px-4'
      }`}
    >
      <div className="mx-auto flex w-full max-w-[343px] sm:max-w-[1160px] flex-col items-center justify-center gap-2">
        {/* Dual-ring Spinner Graphic (Figma Spec: #DBEAFE track + #2563EB animated head) */}
        <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0">
          <div className="absolute inset-0 rounded-full border-4 border-[#DBEAFE]"></div>
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent"></div>
        </div>

        {/* Label Text (Figma Spec: SemiBold 600, #2B2B2B, 16px/24px) */}
        {label && (
          <p className="w-full font-public-sans text-base font-semibold text-[#2B2B2B] leading-6 tracking-tight">
            {label}
          </p>
        )}
      </div>
    </div>
  )
}
