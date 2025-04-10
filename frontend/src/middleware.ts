import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { getCookie } from '@/utils/cookieUtils';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  const accessToken = await  getCookie('accessToken');
  
  // Get role from JWT token if it exists
  let userRole = null;
  if (accessToken) {
    try {
      const decoded = jwtDecode<{ role: string }>(accessToken);
      userRole = decoded.role;
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  // Redirect root `/` to appropriate page based on role
  if (url === '/') {
      return NextResponse.redirect(new URL('/chat', req.url));
  }

  // Handle dashboard access
  if (url.startsWith('/dashboard')) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/chat', req.url));
    }
    // Only allow member and manager roles to access dashboard
    if (userRole === 'user') {
      return NextResponse.redirect(new URL('/chat', req.url));
    }
    // For member role, restrict access to only allowed dashboard pages
    if (userRole === 'member') {
      const allowedPaths = ['/dashboard/member_reservation/report','/dashboard/member_reservation/report', '/dashboard/member_reservation/message','/dashboard/member_reservation/check','/dashboard/member_reservation/check/calender'];
      if (!allowedPaths.some(path => url === path)) {
        return NextResponse.redirect(new URL('/dashboard/member_reservation/check', req.url));
      }
    }
    // Manager role can access all dashboard pages
    return NextResponse.next();
  }

  // Skip middleware for specific paths (auth, API, static assets)
  if (
    url.startsWith('/_next/') ||
    url.startsWith('/assets/') ||
    url === '/maintenance' ||
    url.startsWith('/auth/') || // Exclude all auth routes
    url.startsWith('/api/')    // Exclude all API requests
  ) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Exclude auth, API routes, and static assets from middleware execution
export const config = {
  matcher: ['/((?!_next/|assets/|api/|auth/|maintenance).*)'],
};
