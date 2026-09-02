import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/session';
import { jwtVerify } from 'jose';

// Define protected and public routes
const protectedRoutes = ['/dashboard', '/guru'];
const publicRoutes = ['/login', '/login-guru'];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

  const session = request.cookies.get('session')?.value;
  const secretKey = process.env.SESSION_SECRET || '';
  const key = new TextEncoder().encode(secretKey);

  let isValidSession = false;
  let role: string = 'santri';
  if (session) {
    try {
      const { payload } = await jwtVerify(session, key, { algorithms: ['HS256'] });
      isValidSession = true;
      role = (payload as { user?: { role?: string } })?.user?.role ?? 'santri';
    } catch (err) {
      isValidSession = false;
    }
  }

  const homeFor = (r: string) => (r === 'guru' ? '/guru/dashboard' : '/dashboard');
  const loginFor = (p: string) => (p.startsWith('/guru') ? '/login-guru' : '/login');

  // Redirect to the right login page if accessing a protected route without a valid session
  if (isProtectedRoute && !isValidSession) {
    return NextResponse.redirect(new URL(loginFor(path), request.nextUrl));
  }

  // Redirect a logged-in user away from a public login page to their own area
  if (isPublicRoute && isValidSession) {
    return NextResponse.redirect(new URL(homeFor(role), request.nextUrl));
  }

  // Cross-area guard: a valid session must not reach the other role's protected area
  if (isValidSession) {
    if (path.startsWith('/guru') && role !== 'guru') {
      return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
    }
    if (path.startsWith('/dashboard') && role === 'guru') {
      return NextResponse.redirect(new URL('/guru/dashboard', request.nextUrl));
    }
  }

  // If going to root /, redirect based on session status
  if (path === '/') {
    if (isValidSession) {
      return NextResponse.redirect(new URL(homeFor(role), request.nextUrl));
    }
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // Extend session expiry if accessing protected routes
  return await updateSession(request);
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
