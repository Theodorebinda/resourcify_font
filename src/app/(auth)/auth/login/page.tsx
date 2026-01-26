/**
 * Login Page
 * 
 * Auth route - handles user authentication.
 * Redirects handled by middleware based on user state.
 */

"use client";

import { LoginForm } from "../../../../components/features/auth/login-form";
import Link from "next/link";
import { ROUTES } from "../../../../constants/routes";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sign In</h1>
        <p className="text-muted-foreground mt-2">
          Enter your credentials to access your account
        </p>
      </div>
      
      <LoginForm />

      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href={ROUTES.AUTH.REGISTER}
          className="text-primary hover:underline"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
