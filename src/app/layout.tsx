import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Public_Sans, Space_Grotesk } from "next/font/google";
import { Providers } from "./providers";
import { AuthModal } from "@/components/auth";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-navbar";
import { getSessionUser } from "@/services/auth.service";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Macgence Data Marketplace — Premium Datasets",
  description: "Browse, preview, and purchase high-quality datasets for AI, ML, and analytics. Curated data across industries.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolved server-side so the header renders the correct signed-in/out
  // state on first paint — no client round-trip, and it re-resolves for
  // free whenever router.refresh() re-renders the tree (e.g. right after
  // sign-in/up), instead of waiting on a client-side getUser() call.
  const cookieStore = await cookies();
  const sessionUser = await getSessionUser(cookieStore);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${publicSans.variable} ${spaceGrotesk.variable} antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen flex flex-col bg-[#0a0e1a] text-white font-[family-name:var(--font-geist-sans)]">
        <Providers>
          <SiteHeader initialUser={sessionUser} />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <SiteFooter />
          <AuthModal />
        </Providers>
      </body>
    </html>
  );
}
