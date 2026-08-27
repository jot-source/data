export function DataQuality() {
  return (
    <div id="data-quality" className="scroll-mt-32 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-[#181818]">Data quality &amp; validation</h2>
        <p className="text-sm text-[#616161] leading-5">
          One glance to see whether this dataset has already been independently checked and a clear next step if it hasn&apos;t.
        </p>
      </div>

      {/* Green validation card */}
      <div className="flex items-center gap-0 rounded-xl border border-[#CBD5E1] bg-[#DCFCE7] p-3">
        <div className="flex items-center justify-center rounded-xl bg-[#DCFCE7] p-3">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="13" fill="#15803D" />
            <path d="M10 16l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-base font-medium text-[#15803D]">Every dataset is reviewed before listing.</span>
          <span className="text-xs text-[#616161] leading-4">
            Each dataset undergoes a standard quality and compliance check before being published. Optional advanced QA services are available below.
          </span>
        </div>
      </div>
    </div>
  )
}
