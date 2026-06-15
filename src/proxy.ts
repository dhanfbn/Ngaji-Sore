import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/session';
import { jwtVerify } from 'jose';

// Define protected and public routes
const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/login'];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

  const session = request.cookies.get('session')?.value;
  const secretKey = process.env.SESSION_SECRET || '';
  const key = new TextEncoder().encode(secretKey);

  let isValidSession = false;
  if (session) {
    try {
      await jwtVerify(session, key, { algorithms: ['HS256'] });
      isValidSession = true;
    } catch (err) {
      isValidSession = false;
    }
  }

  // Redirect to login if accessing protected route without valid session
  if (isProtectedRoute && !isValidSession) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // Redirect to dashboard if logged in user tries to access public routes (like login)
  if (isPublicRoute && isValidSession) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }

  // If going to root /, redirect based on session status
  if (path === '/') {
    if (isValidSession) {
      return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
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
