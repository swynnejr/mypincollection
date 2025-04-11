import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "wouter";
import Layout from "@/components/layout";

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Redirect non-admin users away
  React.useEffect(() => {
    if (user && user.id !== 1) {
      navigate("/");
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the admin area.",
        variant: "destructive"
      });
    }
  }, [user, navigate, toast]);

  // Function to handle database reseeding
  const handleReseedDatabase = async () => {
    if (confirm("Are you sure you want to reseed the database? This will remove all existing data and replace it with sample data.")) {
      setIsLoading(true);
      setResult(null);
      
      try {
        const response = await apiRequest("POST", "/api/admin/reseed-database");
        const data = await response.json();
        setResult(data);
        
        toast({
          title: data.success ? "Success" : "Error",
          description: data.message,
          variant: data.success ? "default" : "destructive"
        });
      } catch (error) {
        console.error("Error reseeding database:", error);
        setResult({
          success: false,
          message: error instanceof Error ? error.message : String(error)
        });
        
        toast({
          title: "Error",
          description: "Failed to reseed database",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!user || user.id !== 1) {
    return null; // Will redirect via useEffect
  }

  return (
    <Layout>
      <div className="container px-4 py-8 mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>
                Manage the application database and sample data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-lg font-medium">Reseed Database</h3>
                  <p className="text-sm text-muted-foreground">
                    This will reset the database to its initial state with sample Disney pin data.
                    All existing user data, collections, and messages will be removed.
                  </p>
                  
                  <div className="mt-2">
                    <Button 
                      onClick={handleReseedDatabase} 
                      disabled={isLoading}
                      variant="destructive"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Reseeding...
                        </>
                      ) : (
                        <>Reseed Database</>
                      )}
                    </Button>
                  </div>
                  
                  {result && (
                    <Alert variant={result.success ? "default" : "destructive"} className="mt-4">
                      {result.success ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                      <AlertDescription>{result.message}</AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Database Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Type</p>
                      <p className="text-xl">PostgreSQL</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-xl text-green-500">Connected</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}