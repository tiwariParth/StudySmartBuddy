"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="container py-16 flex flex-col items-center">
      <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-5 rounded-lg relative mb-8 max-w-2xl w-full flex items-start">
        <AlertCircle className="mr-3 mt-0.5 flex-shrink-0" size={20} />
        <div>
          <p className="font-bold mb-2">Something went wrong!</p>
          <p className="text-sm">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
        </div>
      </div>
      
      <div className="space-y-4 text-center max-w-md">
        <p className="text-muted-foreground mb-6">
          We apologize for the inconvenience. You can try refreshing the page or return to the dashboard.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset}>
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              Go to Homepage
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}