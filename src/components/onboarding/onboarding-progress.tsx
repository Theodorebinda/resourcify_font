/**
 * Onboarding Progress Indicator
 * 
 * Displays onboarding progress based on server state (TanStack Query)
 * 
 * Requirements:
 * - Reflects the current onboarding_step from server
 * - Disables future steps
 * - Does not allow free navigation
 * - Progress data comes from server state (TanStack Query)
 */

"use client";

import { useOnboardingStep } from "../../services/api/queries/onboarding-queries";
import { cn } from "../../libs/utils";
import type { OnboardingStep } from "../../types";

interface StepConfig {
  step: OnboardingStep;
  label: string;
  route: string;
}

const ONBOARDING_STEPS: StepConfig[] = [
  { step: "profile", label: "Profile", route: "/onboarding/profile" },
  { step: "interests", label: "Interests", route: "/onboarding/interests" },
];

/**
 * Determines if a step is completed based on current step
 */
function isStepCompleted(
  step: OnboardingStep,
  currentStep: OnboardingStep
): boolean {
  const stepOrder: OnboardingStep[] = [
    "not_started",
    "profile",
    "interests",
    "completed",
  ];
  const stepIndex = stepOrder.indexOf(step);
  const currentIndex = stepOrder.indexOf(currentStep);
  return stepIndex < currentIndex;
}

/**
 * Determines if a step is the current step
 */
function isCurrentStep(step: OnboardingStep, currentStep: OnboardingStep): boolean {
  return step === currentStep;
}

/**
 * Determines if a step is accessible (not a future step)
 */
function isStepAccessible(
  step: OnboardingStep,
  currentStep: OnboardingStep
): boolean {
  // If current step is completed, all steps are accessible (but user should be in app)
  if (currentStep === "completed") {
    return true;
  }
  // Can access current step and previous steps
  return isStepCompleted(step, currentStep) || isCurrentStep(step, currentStep);
}

export function OnboardingProgress() {
  const { data: currentStep, isLoading } = useOnboardingStep();

  if (isLoading || !currentStep) {
    return (
      <div className="flex items-center justify-center gap-2 py-4">
        <div className="h-2 w-2 animate-pulse rounded-full bg-muted" />
        <div className="h-2 w-2 animate-pulse rounded-full bg-muted" />
        <div className="h-2 w-2 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  // If onboarding is completed, don't show progress
  if (currentStep === "completed") {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      {ONBOARDING_STEPS.map((stepConfig, index) => {
        const completed = isStepCompleted(stepConfig.step, currentStep);
        const current = isCurrentStep(stepConfig.step, currentStep);

        return (
          <div key={stepConfig.step} className="flex items-center gap-4">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                  completed
                    ? "border-primary bg-primary text-primary-foreground"
                    : current
                      ? "border-primary bg-background text-primary"
                      : "border-muted bg-background text-muted-foreground"
                )}
              >
                {completed ? "✓" : index + 1}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  current
                    ? "text-foreground"
                    : completed
                      ? "text-muted-foreground"
                      : "text-muted-foreground opacity-50"
                )}
              >
                {stepConfig.label}
              </span>
            </div>

            {/* Connector line */}
            {index < ONBOARDING_STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-12 transition-colors",
                  completed ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
