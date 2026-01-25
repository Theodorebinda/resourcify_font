/**
 * Jest setup file
 * Configures mocks and test environment
 */

// Mock Next.js cookies
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));
