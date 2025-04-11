import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStatus } from "@/lib/protected-route";
import { Link } from "wouter";

interface AuthTooltipProps {
  children: React.ReactNode;
  disabledContent?: React.ReactNode;
}

export function AuthTooltip({ 
  children, 
  disabledContent = "You must be logged in to use this feature" 
}: AuthTooltipProps) {
  const isAuthenticated = useAuthStatus();

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-not-allowed">
            <div className="pointer-events-none opacity-50">
              {children}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p>{disabledContent}</p>
            <Link to="/auth" className="inline-block text-sm font-medium text-primary underline">
              Login or Register
            </Link>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function LoginButton() {
  const isAuthenticated = useAuthStatus();

  if (isAuthenticated) {
    return null;
  }

  return (
    <Link to="/auth" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
      Login / Register
    </Link>
  );
}