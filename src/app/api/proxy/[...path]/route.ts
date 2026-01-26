/**
 * API Proxy Route (BFF - Backend For Frontend)
 * 
 * Proxies all backend API calls through Next.js API routes.
 * This allows:
 * - Reading httpOnly cookies (access_token)
 * - Attaching token to backend requests
 * - Centralized error handling
 * - No client-side token exposure
 * 
 * Usage:
 * - Frontend calls: /api/proxy/user/me/
 * - This route reads access_token from cookies
 * - Makes request to backend: ${API_BASE_URL}/user/me/
 * - Returns response to frontend
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL } from "../../../../constants/api";

const PUBLIC_ENDPOINTS = [
  "auth/login",
  "auth/register",
  "auth/activate",
  "auth/forgot-password",
  "auth/reset-password",
  "auth/resend-activation",
];

const STRIPE_WEBHOOK_PATHS = [
  "webhooks/stripe",
  "stripe/webhook",
];

const REQUEST_TIMEOUT_MS = 10_000;

// Next.js 15: params is now a Promise
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const resolvedParams = await params;
  return handleProxyRequest(request, resolvedParams, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const resolvedParams = await params;
  return handleProxyRequest(request, resolvedParams, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const resolvedParams = await params;
  return handleProxyRequest(request, resolvedParams, "PUT");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const resolvedParams = await params;
  return handleProxyRequest(request, resolvedParams, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const resolvedParams = await params;
  return handleProxyRequest(request, resolvedParams, "DELETE");
}

async function handleProxyRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
): Promise<NextResponse> {
  try {
    // Build backend URL
    // params.path is an array like ["user", "me"] -> "user/me"
    const path = params.path.join("/");
    // Ensure path starts with / for consistency
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const backendUrl = `${API_BASE_URL}${cleanPath}`;

    const normalizedPath = path.replace(/\/+$/, "");
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some((entry) =>
      normalizedPath.startsWith(entry)
    );
    const isStripeWebhook = STRIPE_WEBHOOK_PATHS.some((entry) =>
      normalizedPath.startsWith(entry)
    );

    // Get access_token from httpOnly cookie for protected routes only
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!isPublicEndpoint && !isStripeWebhook && !accessToken) {
      return NextResponse.json(
        { error: { code: "unauthorized", message: "No access token found" } },
        { status: 401 }
      );
    }

    // Get request body if present
    let body: string | undefined;
    if (method !== "GET" && method !== "DELETE") {
      try {
        body = await request.text();
      } catch {
        // No body
      }
    }

    // Get query string from request
    const searchParams = request.nextUrl.searchParams.toString();
    const urlWithQuery = searchParams
      ? `${backendUrl}?${searchParams}`
      : backendUrl;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const headers = new Headers(request.headers);
    headers.set("Content-Type", "application/json");

    if (accessToken && !isPublicEndpoint && !isStripeWebhook) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    // Make request to backend
    const backendResponse = await fetch(urlWithQuery, {
      method,
      headers,
      body: body || undefined,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // If backend returns 401, clear auth cookies
    if (backendResponse.status === 401) {
      const response = NextResponse.json(
        {
          error: {
            code: "unauthorized",
            message: "Session expired",
          },
        },
        { status: 401 }
      );
      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      response.cookies.delete("activated");
      response.cookies.delete("onboarding_step");
      return response;
    }

    // Handle non-JSON responses
    const contentType = backendResponse.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      try {
        const responseData = await backendResponse.json();
        return NextResponse.json(responseData, {
          status: backendResponse.status,
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (jsonError) {
        // If JSON parsing fails, return error
        console.error("[API Proxy] JSON parse error:", jsonError);
        return NextResponse.json(
          {
            error: {
              code: "parse_error",
              message: "Failed to parse backend response",
            },
          },
          { status: 500 }
        );
      }
    }

    // For non-JSON responses, return text
    const responseText = await backendResponse.text();
    return new NextResponse(responseText, {
      status: backendResponse.status,
      headers: {
        "Content-Type": contentType || "text/plain",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          error: {
            code: "timeout",
            message: "Request timed out",
          },
        },
        { status: 504 }
      );
    }
    console.error("[API Proxy] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: {
          code: "proxy_error",
          message: `Failed to proxy request to backend: ${errorMessage}`,
        },
      },
      { status: 500 }
    );
  }
}
