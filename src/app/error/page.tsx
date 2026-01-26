/**
 * Global Error Page
 * 
 * Fallback page for infrastructure-level errors
 * Accessible via direct navigation or middleware redirects
 */

"use client";

import { SomethingWentWrong } from "../../components/error/something-went-wrong";
import { useRouter } from "next/navigation";

export default function ErrorPage() {
  const router = useRouter();

  const handleRetry = () => {
    router.refresh();
  };

  const handleGoBack = () => {
    router.push("/");
  };

  return (
    <SomethingWentWrong
      onRetry={handleRetry}
      onGoBack={handleGoBack}
      message="We encountered an unexpected error. Please try again or return to the home page."
    />
  );
}
