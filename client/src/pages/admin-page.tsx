import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, RefreshCw, Database, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";

// This admin page is for reseeding the database with sample Disney pin data.
// Only the user with ID 1 (admin) can access this page.
export default function AdminPage(): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Redirect non-admin users away
  React.useEffect(() => {
    if (user && !(user.id === 1 || user.username === "devtest")) {
      setLocation("/");
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the admin area.",
        variant: "destructive"
      });
    }
  }, [user, setLocation, toast]);

  // Function to handle database reseeding
  const handleReseedDatabase = async () => {
    if (window.confirm("Are you sure you want to reseed the database? This will remove all existing data and replace it with sample data.")) {
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

  if (!user || !(user.id === 1 || user.username === "devtest")) {
    return (
      <div className="container px-4 py-8 mx-auto max-w-5xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
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

        <Card>
          <CardHeader>
            <CardTitle>eBay Integration</CardTitle>
            <CardDescription>
              Import authentic Disney pin data from eBay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <h3 className="text-lg font-medium">Pin Import Tool</h3>
                <p className="text-sm text-muted-foreground">
                  Search for authentic Disney pins on eBay and import them into your database with real images.
                </p>
                
                <div className="mt-4">
                  <Link href="/admin/ebay-import">
                    <Button>
                      <Search className="mr-2 h-4 w-4" />
                      eBay Pin Import Tool
                    </Button>
                  </Link>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Recommended Searches</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Popular Collections</p>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                      <li>Disney Mickey and Friends pins</li>
                      <li>Disney Princess pins</li>
                      <li>Disney Villains pins</li>
                      <li>Star Wars Disney pins</li>
                      <li>Disney Parks attraction pins</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Search Tips</p>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                      <li>Include "Disney pin" in your search</li>
                      <li>Add specific character names</li>
                      <li>For better matches try "authentic Disney pin"</li>
                      <li>For park exclusive pins try "Disney parks pin"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}