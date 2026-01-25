/**
 * API Route: Set Auth Cookies
 * 
 * Sets authentication cookies after successful login.
 * This allows the middleware to detect authenticated state.
 * 
 * Called by the frontend after login mutation succeeds.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { access_token, user_id, user_activated, onboarding_step } = body;

    // Validate required fields
    if (!access_token || !user_id) {
      return NextResponse.json(
        { error: "Missing required fields: access_token and user_id" },
        { status: 400 }
      );
    }

    // Set cookies for middleware
    const cookieStore = await cookies();
    
    // Set auth_token cookie
    cookieStore.set("auth_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Set user_id cookie
    cookieStore.set("user_id", user_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Set user_activated cookie (if provided)
    if (user_activated !== undefined) {
      cookieStore.set("user_activated", user_activated ? "true" : "false", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    // Set onboarding_step cookie (if provided)
    if (onboarding_step) {
      cookieStore.set("onboarding_step", onboarding_step, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting cookies:", error);
    return NextResponse.json(
      { error: "Failed to set cookies" },
      { status: 500 }
    );
  }
}
