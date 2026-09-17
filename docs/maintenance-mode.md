# Maintenance Mode & Screen Loaders Documentation

This document outlines the architecture, UI components, and deployment steps for handling **Under Maintenance Mode** and **Screen Loaders** across the Data Marketplace platform.

---

## 1. Overview & UI Components

### A. Under Maintenance Card (`MaintenanceCard`)
- **Location**: [`src/components/maintenance/maintenance-card.tsx`](file:///e:/Macgence/Data-Marketplace/src/components/maintenance/maintenance-card.tsx)
- **Design Spec**: Figma 1:1 implementation (`1200px` max-width, `328px` height, `16px` border-radius, `#CBD5E1` border).
- **Features**:
  - Circular gear icon badge (`#DBEAFE` background, `#2563EB` icon).
  - Eyebrow tag: `SCHEDULED MAINTENANCE`.
  - Heading: `We'll be back shortly`.
  - Description: `Upgence is currently undergoing scheduled maintenance to improve performance. Thanks for your patience, we'll be back online soon.`
  - Direct support contact link.

### B. Screen Loader (`ScreenLoader`)
- **Location**: [`src/components/ui/screen-loader.tsx`](file:///e:/Macgence/Data-Marketplace/src/components/ui/screen-loader.tsx)
- **Features**:
  - Animated dual-ring circular spinner matching Figma loader specs.
  - Supports both container-level loading (`fullScreen={false}`) and full-screen backdrop loading (`fullScreen={true}`).

---

## 2. Interactive Preview Route

- **Route**: [`/maintenance`](file:///e:/Macgence/Data-Marketplace/src/app/(public)/maintenance/page.tsx)
- **Purpose**: Allows developers and QA to inspect the full-screen Under Maintenance overlay in local development (`http://localhost:3000/maintenance`).

---

## 3. How to Enable Site-Wide Maintenance Mode in Production

To put the entire platform (`datamarketplace.com`) under maintenance so that **all incoming user traffic** is automatically redirected to the Maintenance page:

### Step 1: Set Environment Variable
In your environment settings (`.env.local` or Vercel / Cloud Environment Variables):

```env
NEXT_PUBLIC_MAINTENANCE_MODE=true
```

### Step 2: Next.js Middleware (`src/middleware.ts`)
Ensure `middleware.ts` is configured in the root directory:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'
  const { pathname } = request.nextUrl

  // Redirect all traffic to /maintenance when maintenance mode is active
  if (isMaintenanceMode && !pathname.startsWith('/maintenance') && !pathname.startsWith('/_next')) {
    return NextResponse.redirect(new URL('/maintenance', request.url))
  }

  // Redirect away from /maintenance when maintenance mode is inactive
  if (!isMaintenanceMode && pathname === '/maintenance') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## 4. How to Deactivate Maintenance Mode

To restore normal operations:
1. Change `NEXT_PUBLIC_MAINTENANCE_MODE=false`.
2. The entire website instantly returns live for all users without requiring a code re-deployment.
