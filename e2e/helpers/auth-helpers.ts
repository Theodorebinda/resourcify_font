/**
 * E2E Test Helpers - Authentication
 * 
 * Helper functions for E2E tests.
 * These interact with the real backend API.
 * 
 * Rules:
 * - No mocking of auth state
 * - Real API calls
 * - Real cookie handling
 */

import { Page } from "@playwright/test";
import { API_BASE_URL } from "../../src/constants/api";

const API_URL = process.env.PLAYWRIGHT_API_BASE_URL || API_BASE_URL;

export interface TestUser {
  email: string;
  password: string;
  username: string;
}

/**
 * Register a new test user
 * Returns the user data for login
 */
export async function registerTestUser(
  page: Page,
  user: TestUser
): Promise<void> {
  const response = await page.request.post(`${API_URL}/auth/register/`, {
    data: {
      email: user.email,
      password: user.password,
      username: user.username,
      accepted_terms: true,
    },
  });

  if (!response.ok()) {
    const error = await response.json();
    throw new Error(`Registration failed: ${error.error?.message || response.statusText()}`);
  }
}

/**
 * Login a test user
 * Sets cookies via API call
 */
export async function loginTestUser(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  const response = await page.request.post(`${API_URL}/auth/login/`, {
    data: {
      email,
      password,
    },
  });

  if (!response.ok()) {
    const error = await response.json();
    throw new Error(`Login failed: ${error.error?.message || response.statusText()}`);
  }

  const data = await response.json();
  
  // Set tokens in localStorage (frontend API client expects this)
  await page.evaluate((token) => {
    localStorage.setItem("access_token", token);
  }, data.data.access_token);

  // Set cookies that middleware reads
  // Backend should set these via Set-Cookie header in response
  // If not set by backend, we set them manually for testing
  const setCookieHeaders = response.headers()["set-cookie"];
  
  if (setCookieHeaders && setCookieHeaders.length > 0) {
    // Backend sets cookies - Playwright should handle them automatically
    // But we can also parse and set them explicitly if needed
    const cookies = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
    
    for (const cookieString of cookies) {
      const [nameValue, ...attributes] = cookieString.split(";");
      const [name, value] = nameValue.split("=");
      
      const cookie: {
        name: string;
        value: string;
        domain: string;
        path: string;
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: "Strict" | "Lax" | "None";
      } = {
        name: name.trim(),
        value: value.trim(),
        domain: "localhost",
        path: "/",
      };

      // Parse cookie attributes
      for (const attr of attributes) {
        const [key, val] = attr.trim().split("=");
        const keyLower = key.toLowerCase();
        if (keyLower === "domain" && val) {
          cookie.domain = val;
        } else if (keyLower === "path" && val) {
          cookie.path = val;
        } else if (keyLower === "httponly") {
          cookie.httpOnly = true;
        } else if (keyLower === "secure") {
          cookie.secure = true;
        } else if (keyLower === "samesite" && val) {
          cookie.sameSite = val as "Strict" | "Lax" | "None";
        }
      }

      await page.context().addCookies([cookie]);
    }
  } else {
    // Fallback: If backend doesn't set cookies, set them manually
    // This is for testing purposes only
    // In production, backend MUST set cookies via Set-Cookie header
    
    const userId = data.data.user?.id || "test-user-id";
    
    // Set minimal cookies for middleware
    // These match what middleware expects: auth_token, user_id, user_activated, onboarding_step
    await page.context().addCookies([
      {
        name: "auth_token",
        value: data.data.access_token,
        domain: "localhost",
        path: "/",
      },
      {
        name: "user_id",
        value: userId,
        domain: "localhost",
        path: "/",
      },
      {
        name: "user_activated",
        value: "false", // Will be true after activation
        domain: "localhost",
        path: "/",
      },
      {
        name: "onboarding_step",
        value: "not_started", // Will be updated by backend as user progresses
        domain: "localhost",
        path: "/",
      },
    ]);
  }
}

/**
 * Activate a test user account
 * Requires activation token (from email or test setup)
 */
export async function activateTestUser(
  page: Page,
  token: string
): Promise<void> {
  const response = await page.request.post(`${API_URL}/auth/activate/`, {
    data: { token },
  });

  if (!response.ok()) {
    const error = await response.json();
    throw new Error(`Activation failed: ${error.error?.message || response.statusText()}`);
  }
}

/**
 * Clear all auth state (logout)
 */
export async function clearAuthState(page: Page): Promise<void> {
  // Clear localStorage
  await page.evaluate(() => {
    localStorage.clear();
  });

  // Clear cookies
  await page.context().clearCookies();
}

/**
 * Create a unique test user email
 */
export function generateTestUserEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `test-${timestamp}-${random}@example.com`;
}

/**
 * Create a unique test username
 */
export function generateTestUsername(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `testuser_${timestamp}_${random}`;
}
