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

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  return handleProxyRequest(request, params, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  return handleProxyRequest(request, params, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  return handleProxyRequest(request, params, "PUT");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  return handleProxyRequest(request, params, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  return handleProxyRequest(request, params, "DELETE");
}

async function handleProxyRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
): Promise<NextResponse> {
  try {
    // Get access_token from httpOnly cookie
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: { code: "unauthorized", message: "No access token found" } },
        { status: 401 }
      );
    }

    // Build backend URL
    const path = params.path.join("/");
    const backendUrl = `${API_BASE_URL}/${path}`;

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

    // Make request to backend
    const backendResponse = await fetch(urlWithQuery, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: body || undefined,
    });

    // Get response data
    const responseData = await backendResponse.json();

    // Return response with same status
    return NextResponse.json(responseData, {
      status: backendResponse.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[API Proxy] Error:", error);
    return NextResponse.json(
      {
        error: {
          code: "proxy_error",
          message: "Failed to proxy request to backend",
        },
      },
      { status: 500 }
    );
  }
}
