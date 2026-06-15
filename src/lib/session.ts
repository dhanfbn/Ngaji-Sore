import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = process.env.SESSION_SECRET;
const key = new TextEncoder().encode(secretKey);

if (!secretKey) {
  console.warn('SESSION_SECRET environment variable is not set. Auth might fail in production.');
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Session valid for 24 hours
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function createSession(user: { id: string; nama: string }) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
  const session = await encrypt({ user, expires });

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.set('session', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  try {
    return await decrypt(session);
  } catch (error) {
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  if (!session) return NextResponse.next();

  try {
    // Verify the session
    const parsed = await decrypt(session);

    // Refresh expiration
    const res = NextResponse.next();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    parsed.expires = expires;
    const refreshedToken = await encrypt(parsed);

    res.cookies.set({
      name: 'session',
      value: refreshedToken,
      httpOnly: true,
      expires,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return res;
  } catch (error) {
    return NextResponse.next();
  }
}
