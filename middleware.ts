import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const role = (req.nextauth.token as any)?.role

    if (!pathname.startsWith('/dashboard')) return NextResponse.next()

    const roleRouteMap: Record<string, string> = {
      pastor: '/dashboard/church/pastor',
      registrar: '/dashboard/church/registrar',
      accountant: '/dashboard/church/accountant',
      district_admin: '/dashboard/district',
      province_admin: '/dashboard/province',
      national_admin: '/dashboard/admin',
    }

    // Redirect /dashboard to role-specific dashboard
    if (pathname === '/dashboard') {
      const target = roleRouteMap[role] ?? '/login'
      return NextResponse.redirect(new URL(target, req.url))
    }

    // Prevent cross-role access
    const allowedPath = roleRouteMap[role]
    if (allowedPath && !pathname.startsWith(allowedPath)) {
      return NextResponse.redirect(new URL(allowedPath, req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*'],
}
