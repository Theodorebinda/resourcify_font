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
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginFormData } from "../../../lib/validations/auth";
import { useLogin, useResendActivation } from "../../../services/api/queries/auth-queries";
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
  const resendActivationMutation = useResendActivation();
  const [accountNotActivated, setAccountNotActivated] = useState(false);
  const [activationEmailSent, setActivationEmailSent] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    // Reset state related to activation on new submit
    setAccountNotActivated(false);
    setActivationEmailSent(false);

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
        setAccountNotActivated(true);
        form.setError("root", {
          message:
            apiError.message ||
            "Votre compte n'est pas encore activé. Vous pouvez demander un nouvel email d'activation.",
        });
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

  const handleResendActivation = async () => {
    const formEmail = form.getValues("email");
    const storedEmail =
      typeof window !== "undefined"
        ? localStorage.getItem("last_login_email") ?? ""
        : "";

    const email = formEmail || storedEmail;

    if (!email) {
      showToast({
        title: "Email requis",
        description: "Veuillez saisir votre email pour renvoyer le lien d'activation.",
        variant: "destructive",
      });
      return;
    }

    try {
      await resendActivationMutation.mutateAsync({ email });
      setActivationEmailSent(true);
      showToast({
        title: "Email d'activation renvoyé",
        description:
          "Si un compte existe pour cet email, un nouveau lien d'activation vient d'être envoyé.",
      });
    } catch (error) {
      const apiError = error as ApiError;
      showToast({
        title: "Erreur lors de l'envoi",
        description:
          apiError.message ||
          "Une erreur est survenue lors du renvoi de l'email d'activation. Veuillez réessayer.",
        variant: "destructive",
      });
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

        {accountNotActivated && (
          <div className="space-y-2 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm">
            <p className="font-medium text-yellow-800">
              Votre compte n&apos;est pas encore activé.
            </p>
            <p className="text-yellow-800/80">
              Cliquez sur le bouton ci-dessous pour recevoir un nouveau lien
              d&apos;activation par email.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleResendActivation}
              disabled={resendActivationMutation.isPending}
            >
              {resendActivationMutation.isPending
                ? "Envoi en cours..."
                : "Renvoyer l&apos;email d&apos;activation"}
            </Button>
            {activationEmailSent && (
              <p className="text-xs text-green-700">
                Si un compte existe pour cet email, un nouveau lien d&apos;activation a été envoyé.
              </p>
            )}
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
