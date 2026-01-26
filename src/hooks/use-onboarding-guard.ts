/**
 * Hook de garde pour les pages onboarding
 * 
 * Vérifie l'état et redirige automatiquement si incohérent
 * Conforme à ONBOARDING_REFONTE.md - Section 6.1
 * 
 * Usage:
 * ```tsx
 * const { isValid, isLoading, user } = useOnboardingGuard("profile");
 * 
 * if (isLoading) return <Spinner />;
 * if (!isValid) return null; // Redirection en cours
 * 
 * // Rendre le formulaire
 * ```
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../services/api/queries/auth-queries";
import { getRouteForStep } from "../utils/onboarding-routes";
import type { OnboardingStep } from "../types";

/**
 * Hook de garde pour les pages onboarding
 * 
 * Vérifie que l'utilisateur est à la bonne étape d'onboarding
 * et redirige automatiquement si l'état est incohérent
 * 
 * @param expectedStep - L'étape attendue pour cette page
 * @returns { isValid, isLoading, user }
 */
export function useOnboardingGuard(expectedStep: OnboardingStep) {
  const router = useRouter();
  const { user, isLoading } = useUser();
  
  useEffect(() => {
    if (isLoading) return;
    
    // Auto-réparation: si l'état est incohérent, rediriger silencieusement
    if (user?.onboarding_step && user.onboarding_step !== expectedStep) {
      const correctRoute = getRouteForStep(user.onboarding_step);
      router.replace(correctRoute);
    }
  }, [user, isLoading, expectedStep, router]);
  
  return {
    isValid: user?.onboarding_step === expectedStep,
    isLoading,
    user,
  };
}
