/**
 * API Route: Establish Session
 * 
 * Creates HTTP cookies from backend login response.
 * This is the bridge between backend and Next.js middleware.
 * 
 * The backend SHOULD set cookies directly, but if it cannot
 * (e.g., cross-domain issues), this route acts as a fallback.
 * 
 * Contract:
 * - Receives: { access_token, refresh_token, user: { id, activated, onboarding_step } }
 * - Sets: HTTP cookies readable by middleware
 * - Returns: { ok: true }
 * 
 * ⚠️ This route is NOT for authentication logic.
 * ⚠️ It ONLY persists state in cookies.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import type { LoginResponse } from "../../../../types";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { access_token, refresh_token } = body as Partial<LoginResponse>;

    // If access_token is provided (from login), use it
    // Otherwise, read from existing cookie (for user state sync)
    const cookieStore = await cookies();
    const existingToken = cookieStore.get("access_token")?.value;
    
    const tokenToSet = access_token || existingToken;
    
    // Validate required fields
    if (!tokenToSet) {
      return NextResponse.json(
        { error: "Missing access_token" },
        { status: 400 }
      );
    }
    
    // User data is not required - only tokens are stored in cookies

    const isCrossSite = process.env.NEXT_PUBLIC_COOKIE_CROSS_SITE === "true";
    const sameSite = isCrossSite ? "none" : "lax";
    const secure = isCrossSite || process.env.NODE_ENV === "production";

    // Create response
    const response = NextResponse.json({ ok: true });

    // Set access_token cookie (httpOnly for security)
    // This is the ONLY place tokens are stored - no localStorage
    if (access_token) {
      response.cookies.set("access_token", access_token, {
        httpOnly: true,
        secure,
        sameSite,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    // Set refresh_token cookie (httpOnly for security)
    if (refresh_token) {
      response.cookies.set("refresh_token", refresh_token, {
        httpOnly: true,
        secure,
        sameSite,
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    // Only tokens are stored in cookies
    // activated and onboarding_step are retrieved via API calls

    return response;
  } catch (error) {
    console.error("[API /auth/session] Error:", error);
    return NextResponse.json(
      { error: "Failed to establish session" },
      { status: 500 }
    );
  }
}
