/**
 * Login Form Component
 * 
 * Handles user authentication with proper error handling
 * - Shows account_not_activated error explicitly
 * - Uses TanStack Query for server state
 * - Client-side validation with Zod
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginFormData } from "../../../lib/validations/auth";
import { useLogin } from "../../../services/api/queries/auth-queries";
import { Button } from "../../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { useToast } from "../../../hooks/use-toast";
import { ROUTES } from "../../../constants/routes";
import type { ApiError } from "../../../types";

export function LoginForm() {
  const router = useRouter();
  const { toast: showToast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Store email in localStorage for resend activation
      if (typeof window !== "undefined") {
        localStorage.setItem("last_login_email", data.email);
      }

      await loginMutation.mutateAsync(data);
      
      showToast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      
      // Redirect to canonical post-login entry point
      // Middleware will decide the next step based on user state
      router.push(ROUTES.AUTH.POST_LOGIN);
      router.refresh();
    } catch (error) {
      const apiError = error as ApiError;
      
      // Handle specific error codes from backend
      if (apiError.code === "account_not_activated") {
        showToast({
          title: "Account Not Activated",
          description: apiError.message || "Please activate your account via email before logging in",
          variant: "destructive",
        });
        // Still redirect to post-login - middleware will handle it
        router.push(ROUTES.AUTH.POST_LOGIN);
        router.refresh();
      } else if (apiError.code === "invalid_credentials") {
        form.setError("root", {
          message: apiError.message || "Invalid email or password",
        });
      } else {
        form.setError("root", {
          message: apiError.message || "An error occurred. Please try again.",
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <div className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </Form>
  );
}
