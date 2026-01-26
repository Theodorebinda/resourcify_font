/**
 * Register Page
 * 
 * Auth route - handles new user registration.
 * On success, redirects to activation-required page.
 */

"use client";

import { RegisterForm } from "../../../../components/features/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="text-muted-foreground mt-2">
          Sign up to get started with Ressourcefy
        </p>
      </div>
      
      <RegisterForm />
    </div>
  );
}
