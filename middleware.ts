import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// Define route access rules
const publicRoutes = ['/login', '/register'];
const adminRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // Allow API routes and static files
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico')
    ) {
        return NextResponse.next();
    }

    // Get token from cookie or Authorization header
    let token = request.cookies.get('token')?.value;

    const authHeader = request.headers.get('Authorization');
    if (!token && authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    }

    // Redirect to login if no token
    if (!token) {
        // Only redirect page requests, not API or static assets
        if (pathname === '/login' || pathname === '/register') {
            return NextResponse.next();
        }
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('from', pathname);
        return NextResponse.redirect(url);
    }

    // Verify token (async)
    const payload = await verifyToken(token);
    if (!payload) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('from', pathname);
        return NextResponse.redirect(url);
    }

    // Check admin routes
    if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
    ],
};
