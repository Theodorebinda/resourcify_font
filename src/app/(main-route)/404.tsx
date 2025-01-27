import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import React from "react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center max-w-md w-full">
        <AlertTriangle className="mx-auto mb-6 h-16 w-16 text-destructive" />

        <h1 className="text-4xl font-bold mb-4 text-foreground">
          404 - Page Not Found
        </h1>

        <p className="text-muted-foreground mb-6">
          Oops! The page you are looking for seems to have wandered off into the
          digital wilderness.
        </p>

        <div className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/">Return Home</Link>
          </Button>

          <Button asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
