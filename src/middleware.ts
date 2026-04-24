/**
 * CSRF Protection Middleware
 * Implements double-submit cookie pattern for CSRF protection
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createCSRFToken,
  validateCSRFToken,
  extractCSRFTokenFromRequest,
  requiresCSRFProtection,
  generateCSRFCookie,
  validateCSRFCookie,
  getCSRFConfig,
  type CSRFConfig,
} from "@/lib/csrfUtils";

export function middleware(request: NextRequest) {
  const config = getCSRFConfig();
  const { cookieName = "csrf_token", headerName = "x-csrf-token" } = config;

  // Get or create session ID
  let sessionId = request.cookies.get("session_id")?.value;
  
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }

  // Check if request requires CSRF protection
  if (requiresCSRFProtection(request.method)) {
    // Get CSRF token from header
    const headerToken = extractCSRFTokenFromRequest(request.headers, config);
    
    // Get CSRF token from cookie
    const cookieToken = request.cookies.get(cookieName)?.value;
    
    // Validate CSRF token
    if (!headerToken || !cookieToken) {
      return new NextResponse("CSRF token missing", { status: 403 });
    }
    
    // Validate using double-submit pattern
    if (!validateCSRFCookie(cookieToken, headerToken)) {
      return new NextResponse("CSRF token invalid", { status: 403 });
    }
    
    // Also validate against stored token
    if (!validateCSRFToken(sessionId, headerToken, config)) {
      return new NextResponse("CSRF token expired or invalid", { status: 403 });
    }
  }

  // Generate new CSRF token for GET requests
  if (request.method === "GET") {
    const csrfToken = createCSRFToken(sessionId, config);
    const cookieValue = generateCSRFCookie(csrfToken.token);
    
    const response = NextResponse.next();
    
    // Set CSRF cookie with SameSite attribute
    response.cookies.set(cookieName, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600, // 1 hour
      path: "/",
    });
    
    // Set session ID cookie
    response.cookies.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 24 hours
      path: "/",
    });
    
    // Add CSRF token to response headers for client-side access
    response.headers.set(headerName, csrfToken.token);
    response.headers.set("x-csrf-token-expires", csrfToken.expiresAt.toISOString());
    
    return response;
  }

  // For other methods, just pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply to all API routes except static files and public routes
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
