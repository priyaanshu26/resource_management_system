import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key'
);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
    userId: number;
    email: string;
    role: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

/**
 * Compare a plain password with a hashed password
 */
export async function comparePassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token for a user
 */
export async function generateToken(payload: JWTPayload): Promise<string> {
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        // Validate and extract our custom payload structure
        if (
            payload &&
            typeof payload.userId === 'number' &&
            typeof payload.email === 'string' &&
            typeof payload.role === 'string'
        ) {
            return {
                userId: payload.userId,
                email: payload.email,
                role: payload.role,
            };
        }
        return null;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

/**
 * Get the current user from the token in cookies or Authorization header
 */
export async function getCurrentUser() {
    try {
        let token: string | undefined;

        // Try to get token from cookies
        const cookieStore = await cookies();
        token = cookieStore.get('token')?.value;

        // If no token in cookies, try Authorization header (for client-side fetches with Bearer token)
        if (!token) {
            // Note: cookies() doesn't have headers. For headers, we need another way.
            // In Next.js 13+ app directory, we can use headers() from next/headers
            const { headers } = await import('next/headers');
            const headerStore = await headers();
            const authHeader = headerStore.get('Authorization');
            if (authHeader?.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return null;
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return null;
        }

        // Fetch full user data from database
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Get the current user from Authorization header (for API routes)
 */
export async function getUserFromAuthHeader(authHeader: string | null): Promise<JWTPayload | null> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    return await verifyToken(token);
}

/**
 * Common helper to get user from request (checks both cookies and headers)
 */
export async function getAuthUser(request: NextRequest | Request) {
    // Try cookie first (Standard Next.js)
    if ('cookies' in request && typeof (request as any).cookies?.get === 'function') {
        const token = (request as any).cookies.get('token')?.value;
        if (token) {
            const payload = await verifyToken(token);
            if (payload) return payload;
        }
    }

    // Try Authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = await verifyToken(token);
        if (payload) return payload;
    }

    return null;
}

