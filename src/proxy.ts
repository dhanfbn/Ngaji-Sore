import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/session';
import { jwtVerify } from 'jose';

type Role = 'santri' | 'guru' | 'admin';

// Each role owns one protected area and one public login page.
const AREAS: Record<Role, { protectedPath: string; loginPath: string }> = {
  santri: { protectedPath: '/dashboard', loginPath: '/login' },
  guru: { protectedPath: '/guru', loginPath: '/login-guru' },
  admin: { protectedPath: '/admin', loginPath: '/login-admin' },
};
const ROLES = Object.keys(AREAS) as Role[];

const protectedRoutes = ROLES.map((r) => AREAS[r].protectedPath);
const publicRoutes = ROLES.map((r) => AREAS[r].loginPath);

function homeFor(role: Role): string {
  return `${AREAS[role].protectedPath}/dashboard`;
}

function loginFor(path: string): string {
  const role = ROLES.find((r) => path.startsWith(AREAS[r].protectedPath));
  return role ? AREAS[role].loginPath : AREAS.santri.loginPath;
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

  const session = request.cookies.get('session')?.value;
  const secretKey = process.env.SESSION_SECRET || '';
  const key = new TextEncoder().encode(secretKey);

  let isValidSession = false;
  let role: Role = 'santri';
  if (session) {
    try {
      const { payload } = await jwtVerify(session, key, { algorithms: ['HS256'] });
      isValidSession = true;
      role = ((payload as { user?: { role?: string } })?.user?.role as Role) ?? 'santri';
    } catch (err) {
      isValidSession = false;
    }
  }

  // Redirect to the right login page if accessing a protected route without a valid session
  if (isProtectedRoute && !isValidSession) {
    return NextResponse.redirect(new URL(loginFor(path), request.nextUrl));
  }

  // Redirect a logged-in user away from a public login page to their own area
  if (isPublicRoute && isValidSession) {
    return NextResponse.redirect(new URL(homeFor(role), request.nextUrl));
  }

  // Cross-area guard: a valid session must not reach another role's protected area
  if (isValidSession) {
    for (const r of ROLES) {
      if (r !== role && path.startsWith(AREAS[r].protectedPath)) {
        return NextResponse.redirect(new URL(homeFor(role), request.nextUrl));
      }
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
