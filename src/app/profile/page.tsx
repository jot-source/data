import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { ensureUserRow } from '@/services/auth.service'
import { getSavedDatasets } from '@/actions/saved-dataset.actions'
import { ProfileClient } from '@/components/profile'

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const session = await ensureUserRow(cookieStore)

  if (!session) {
    redirect('/')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      fullName: true,
      email: true,
      organization: true,
      industry: true,
      jobTitle: true,
    }
  })

  if (!dbUser) {
    redirect('/')
  }

  // Fetch saved datasets for the wishlist section
  const { datasets: savedDatasets } = await getSavedDatasets()

  // Need a wrapper to have light background for this page specifically,
  // since root layout has bg-[#0a0e1a] (dark theme) and profile design is light theme.
  return (
    <div className="flex-1 bg-[#F8FAFC] text-black">
      <ProfileClient user={dbUser} savedDatasets={savedDatasets} />
    </div>
  )
}
