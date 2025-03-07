import { NextResponse, NextRequest } from 'next/server';
import { getSession } from 'next-auth/react';

export async function middleware(req: NextRequest) {
  const session = await getSession({ req: req as any });  // Type assertion to bypass type mismatch
  
  if (!session && req.nextUrl.pathname.startsWith('/admin/dashboard')) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// This ensures the middleware runs in Node.js rather than Edge
export const config = {
  matcher: '/admin/:path*',
  runtime: 'nodejs',  // Use Node.js runtime
};
