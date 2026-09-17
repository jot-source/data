'use client'

import { SkeletonFooter } from '@/components/ui/skeleton-footer'

export function HomePageSkeleton() {
  return (
    <div className="fixed inset-0 z-[999] flex min-h-screen w-full flex-col overflow-y-auto bg-white font-public-sans text-[#181818]">
      {/* 1. Navbar Skeleton (Matching Image 3 from Figma specs - 72px) */}
      <div className="flex h-[72px] w-full shrink-0 items-center justify-between border-b border-[#F1F5F9] bg-white px-4 sm:px-10 lg:px-[120px]">
        {/* Brand Logo Pill */}
        <div className="h-9 w-32 animate-pulse rounded-lg bg-[#E7E9ED]"></div>

        {/* Middle Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <div className="h-5 w-24 animate-pulse rounded-full bg-[#E7E9ED]"></div>
          <div className="h-5 w-24 animate-pulse rounded-full bg-[#E7E9ED]"></div>
          <div className="h-5 w-24 animate-pulse rounded-full bg-[#E7E9ED]"></div>
          <div className="h-5 w-24 animate-pulse rounded-full bg-[#E7E9ED]"></div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-[#E7E9ED]"></div>
          <div className="h-10 w-28 animate-pulse rounded-[12px] bg-[#E7E9ED]"></div>
        </div>
      </div>

      {/* 2. Hero Section Wireframe (FULL VIEWPORT HEIGHT: 100vh - 72px navbar) */}
      <div className="w-full shrink-0 bg-white px-4 h-[calc(100vh-72px)] flex flex-col items-center justify-center text-center border-b border-[#F1F5F9]">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6">
          {/* Top Pill 1 */}
          <div className="h-9 w-[480px] max-w-full animate-pulse rounded-lg bg-[#E7E9ED]"></div>

          {/* Top Pill 2 */}
          <div className="h-9 w-[560px] max-w-full animate-pulse rounded-lg bg-[#E7E9ED]"></div>

          {/* Line 3 (Very wide) */}
          <div className="h-5 w-[640px] max-w-full animate-pulse rounded-full bg-[#E7E9ED] mt-2"></div>

          {/* Line 4 (Narrower) */}
          <div className="h-5 w-[440px] max-w-full animate-pulse rounded-full bg-[#E7E9ED]"></div>

          {/* 2 Buttons Side by Side ("Explore marketplace" & "Schedule a Call") */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="h-11 w-[150px] animate-pulse rounded-xl bg-[#E7E9ED]"></div>
            <div className="h-11 w-[150px] animate-pulse rounded-xl bg-[#E7E9ED]"></div>
          </div>
        </div>
      </div>

      {/* 3. Trusted By Companies Section Wireframe (Below the fold - When scrolled) */}
      <div className="w-full shrink-0 bg-white px-4 py-20 text-center border-b border-[#F1F5F9]">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-8">
          {/* 5 "Trusted by leading AI companies" Logo Boxes Row */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="h-12 w-[160px] sm:w-[170px] animate-pulse rounded-xl bg-[#E7E9ED]"></div>
            <div className="h-12 w-[160px] sm:w-[170px] animate-pulse rounded-xl bg-[#E7E9ED]"></div>
            <div className="h-12 w-[160px] sm:w-[170px] animate-pulse rounded-xl bg-[#E7E9ED]"></div>
            <div className="h-12 w-[160px] sm:w-[170px] animate-pulse rounded-xl bg-[#E7E9ED]"></div>
            <div className="h-12 w-[160px] sm:w-[170px] animate-pulse rounded-xl bg-[#E7E9ED]"></div>
          </div>

          {/* Thin Horizontal Divider Line below company logos */}
          <div className="h-4 w-[600px] max-w-full animate-pulse rounded-full bg-[#E7E9ED]"></div>
        </div>
      </div>

      {/* 4. Main Outer Grey Container Box (Figma Rectangle 5520: Width 1,201px, Height 1,108px, Radius 28px, Color #B6B6B6) */}
      <div className="mx-auto w-full max-w-[1201px] px-4 sm:px-0 py-8">
        <div className="w-full h-[1108px] rounded-[28px] bg-[#B6B6B6] p-6 sm:p-8 shadow-md flex flex-col justify-between">
          {/* Top Bar inside container */}
          <div className="h-14 w-full animate-pulse rounded-2xl bg-[#E7E9ED]"></div>

          {/* Filter/Tabs Box inside container */}
          <div className="rounded-2xl bg-[#E7E9ED] p-5 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <div className="h-6 w-28 animate-pulse rounded-full bg-white/70"></div>
                <div className="h-6 w-24 animate-pulse rounded-full bg-white/70"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-20 animate-pulse rounded-full bg-white/70"></div>
                <div className="h-6 w-24 animate-pulse rounded-full bg-white/70"></div>
                <div className="h-6 w-24 animate-pulse rounded-full bg-white/70"></div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-32 animate-pulse rounded-full bg-white/70"></div>
              <div className="h-6 w-28 animate-pulse rounded-full bg-white/70"></div>
            </div>
          </div>

          {/* 2x2 Grid of 4 Cards (Figma Rectangle 5523: Width 558px, Height 314px, Color #E7E9ED) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex w-full max-w-[558px] h-[314px] flex-col justify-between rounded-2xl bg-[#E7E9ED] p-6 shadow-xs animate-pulse mx-auto"
              >
                {/* Card Top */}
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-xl bg-white/70"></div>
                  <div className="h-6 w-20 rounded-full bg-white/70"></div>
                </div>

                {/* Card Body Lines */}
                <div className="flex flex-col gap-3 my-2">
                  <div className="flex gap-2">
                    <div className="h-3.5 flex-1 rounded-full bg-white/70"></div>
                    <div className="h-3.5 flex-1 rounded-full bg-white/70"></div>
                    <div className="h-3.5 flex-1 rounded-full bg-white/70"></div>
                  </div>
                  <div className="flex gap-2 w-3/4">
                    <div className="h-3.5 flex-1 rounded-full bg-white/70"></div>
                    <div className="h-3.5 flex-1 rounded-full bg-white/70"></div>
                  </div>
                  <div className="flex gap-2 w-2/3">
                    <div className="h-3.5 flex-1 rounded-full bg-white/70"></div>
                    <div className="h-3.5 flex-1 rounded-full bg-white/70"></div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-2">
                  <div className="h-4 w-28 rounded bg-white/70"></div>
                  <div className="h-9 w-28 rounded-lg bg-white/70"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Center Action Button inside container */}
          <div className="flex justify-center pt-2">
            <div className="h-12 w-44 animate-pulse rounded-xl bg-[#E7E9ED]"></div>
          </div>
        </div>
      </div>

      {/* 5. How It Works Wireframe Section (Figma Frame 2147240653: Width 1,440px, Height 736px, Color #B6B6B6) */}
      <div className="w-full shrink-0 bg-[#B6B6B6] text-center">
        <div className="mx-auto flex w-full max-w-[1440px] h-[736px] flex-col items-center justify-center gap-6 px-4 py-12">
          {/* Top Center Box */}
          <div className="h-24 w-40 animate-pulse rounded-2xl bg-[#E7E9ED]"></div>

          {/* Heading Line 1 */}
          <div className="h-6 w-[560px] max-w-full animate-pulse rounded-full bg-[#E7E9ED]"></div>

          {/* Heading Line 2 */}
          <div className="h-5 w-[700px] max-w-full animate-pulse rounded-full bg-[#E7E9ED]"></div>

          {/* 4 Step Cards Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-[1200px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex h-40 flex-col justify-between rounded-2xl bg-[#E7E9ED] p-5 shadow-xs animate-pulse"
              >
                <div className="h-16 w-full rounded-xl bg-white/70"></div>
                <div className="h-4 w-3/4 rounded-full bg-white/70"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Testimonials / Trust Section Wireframe (Figma Specs: Width 1,440px, Height 736px, White Background) */}
      <div className="w-full shrink-0 bg-white text-center">
        <div className="mx-auto flex w-full max-w-[1440px] h-[736px] flex-col items-center justify-center gap-6 px-4 py-12">
          {/* Heading Line 1 */}
          <div className="h-6 w-[560px] max-w-full animate-pulse rounded-full bg-[#E7E9ED]"></div>

          {/* Heading Line 2 */}
          <div className="h-5 w-[700px] max-w-full animate-pulse rounded-full bg-[#E7E9ED]"></div>

          {/* 4 Circle Avatars Row */}
          <div className="my-6 flex items-center justify-center gap-8">
            <div className="h-14 w-14 animate-pulse rounded-full bg-[#E7E9ED]"></div>
            <div className="h-14 w-14 animate-pulse rounded-full bg-[#E7E9ED]"></div>
            <div className="h-14 w-14 animate-pulse rounded-full bg-[#E7E9ED]"></div>
            <div className="h-14 w-14 animate-pulse rounded-full bg-[#E7E9ED]"></div>
          </div>

          {/* Bottom Wide Testimonial Container */}
          <div className="w-full max-w-[960px] rounded-2xl bg-[#E7E9ED] p-6 flex flex-col sm:flex-row items-center gap-6 shadow-xs animate-pulse">
            <div className="h-16 w-16 shrink-0 rounded-xl bg-white/70"></div>
            <div className="flex flex-col gap-2.5 flex-1 w-full text-left">
              <div className="h-4 w-1/2 rounded bg-white/70"></div>
              <div className="h-4 w-4/5 rounded bg-white/70"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Submit Requirements / Form Wireframe Section (Figma Frame 2147240660: Width 1,440px, Height 736px, Color #B6B6B6) */}
      <div className="w-full shrink-0 bg-[#B6B6B6]">
        <div className="mx-auto flex w-full max-w-[1440px] h-[736px] items-center justify-between gap-12 px-4 sm:px-12 py-12">
          <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Paragraph Lines */}
            <div className="flex flex-col gap-4">
              <div className="h-8 w-64 animate-pulse rounded-lg bg-[#E7E9ED]"></div>
              <div className="h-8 w-48 animate-pulse rounded-lg bg-[#E7E9ED]"></div>
              <div className="flex flex-col gap-2.5 mt-4">
                <div className="h-4 w-full animate-pulse rounded bg-[#E7E9ED]"></div>
                <div className="h-4 w-full animate-pulse rounded bg-[#E7E9ED]"></div>
                <div className="h-4 w-full animate-pulse rounded bg-[#E7E9ED]"></div>
                <div className="h-4 w-full animate-pulse rounded bg-[#E7E9ED]"></div>
                <div className="h-4 w-4/5 animate-pulse rounded bg-[#E7E9ED]"></div>
              </div>
            </div>

            {/* Right Column: Form Card Wireframe */}
            <div className="w-full max-w-[480px] h-[520px] rounded-3xl bg-white p-6 shadow-md flex flex-col justify-between animate-pulse justify-self-end">
              <div className="h-4 w-32 rounded bg-[#E7E9ED]"></div>
              <div className="h-4 w-48 rounded bg-[#E7E9ED]"></div>
              <div className="h-10 w-full rounded-lg bg-[#E7E9ED]"></div>
              <div className="h-4 w-28 rounded bg-[#E7E9ED]"></div>
              <div className="h-14 w-full rounded-lg bg-[#E7E9ED]"></div>
              <div className="h-4 w-28 rounded bg-[#E7E9ED]"></div>
              <div className="h-10 w-full rounded-lg bg-[#E7E9ED]"></div>
              <div className="h-4 w-28 rounded bg-[#E7E9ED]"></div>
              <div className="h-10 w-full rounded-lg bg-[#E7E9ED]"></div>
              <div className="h-3.5 w-48 rounded bg-[#E7E9ED] mx-auto"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 8. FAQ & CTA Banner Section Wireframe (Figma Specs: Width 1,440px, Height 1,096px, White Background) */}
      <div className="w-full shrink-0 bg-white">
        <div className="mx-auto flex w-full max-w-[1440px] h-[1096px] flex-col justify-between px-4 sm:px-12 py-16">
          {/* Top FAQ Block */}
          <div className="mx-auto flex w-full max-w-[1200px] items-start justify-between gap-8">
            {/* Left Title Bar */}
            <div className="h-8 w-72 animate-pulse rounded-full bg-[#E7E9ED]"></div>

            {/* Right Stacked Block */}
            <div className="flex flex-col gap-3 w-[320px]">
              <div className="h-20 w-full animate-pulse rounded-xl bg-[#E7E9ED]"></div>
              <div className="h-4 w-full animate-pulse rounded bg-[#E7E9ED]"></div>
              <div className="h-4 w-full animate-pulse rounded bg-[#E7E9ED]"></div>
              <div className="h-4 w-full animate-pulse rounded bg-[#E7E9ED]"></div>
              <div className="h-4 w-full animate-pulse rounded bg-[#E7E9ED]"></div>
              <div className="h-4 w-3/4 animate-pulse rounded bg-[#E7E9ED]"></div>
            </div>
          </div>

          {/* Bottom CTA Banner Box (Figma Rectangle 5544: Width 1,200px, Height 245px, Radius 8px) */}
          <div className="mx-auto w-full max-w-[1200px] h-[245px] rounded-[8px] bg-[#E7E9ED] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs animate-pulse">
            <div className="flex flex-col gap-3 flex-1 w-full">
              <div className="h-7 w-64 rounded bg-white/70"></div>
              <div className="h-4 w-full max-w-[500px] rounded bg-white/70"></div>
              <div className="h-4 w-full max-w-[400px] rounded bg-white/70"></div>
            </div>
            <div className="h-12 w-40 shrink-0 rounded-lg bg-white/70"></div>
          </div>
        </div>
      </div>

      {/* 9. Figma Wireframe Footer */}
      <SkeletonFooter />
    </div>
  )
}
