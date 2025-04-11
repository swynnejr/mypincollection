import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route } from "wouter";

// Create a context to check if user is authenticated throughout the app
import { createContext, useContext } from "react";

export const AuthStatusContext = createContext<boolean>(false);

export function useAuthStatus() {
  return useContext(AuthStatusContext);
}

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  
  // Instead of redirecting, we'll pass the authentication status to the component
  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      ) : (
        <AuthStatusContext.Provider value={!!user}>
          <Component />
        </AuthStatusContext.Provider>
      )}
    </Route>
  );
}
