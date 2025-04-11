import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CollectionPage from "@/pages/collection-page";
import PinDetailPage from "@/pages/pin-detail-page";
import WantListPage from "@/pages/wantlist-page";
import { ProtectedRoute } from "./lib/protected-route";
import Layout from "@/components/layout";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="*">
        <Layout>
          <Switch>
            <ProtectedRoute path="/" component={HomePage} />
            <ProtectedRoute path="/collection" component={CollectionPage} />
            <ProtectedRoute path="/wantlist" component={WantListPage} />
            <ProtectedRoute path="/pin/:id" component={PinDetailPage} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
