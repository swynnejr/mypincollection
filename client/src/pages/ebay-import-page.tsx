import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Pin, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function EbayImportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [importingIds, setImportingIds] = useState<Record<string, boolean>>({});

  // Check if user is admin (for now, just check if it's user ID 1 or username "devtest")
  const isAdmin = user && (user.id === 1 || user.username === "devtest");

  // If not admin, redirect to home
  if (!isAdmin) {
    return <Redirect to="/" />;
  }

  const handleSearch = async () => {
    if (!searchTerm) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      const response = await apiRequest("GET", `/api/ebay/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      
      if (data.itemSummaries && data.itemSummaries.length > 0) {
        setSearchResults(data.itemSummaries);
      } else {
        toast({
          title: "No results found",
          description: "No Disney pins were found matching your search term",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error searching eBay:", error);
      toast({
        title: "Search failed",
        description: "Failed to search eBay for Disney pins",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const importPin = async (item: any) => {
    if (!item || importingIds[item.itemId]) return;
    
    setImportingIds(prev => ({ ...prev, [item.itemId]: true }));
    
    try {
      // Extract needed details from the eBay item
      const pinData = {
        name: item.title,
        imageUrl: item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl,
        price: item.price?.value,
        collection: determineCollection(item.title),
        category: determineCategory(item.title),
        description: `Authentic Disney Pin: ${item.title}`,
      };
      
      // Send to our API
      await apiRequest("POST", "/api/admin/import-pin-from-ebay", pinData);
      
      // Invalidate pins cache
      queryClient.invalidateQueries({ queryKey: ["/api/pins"] });
      
      toast({
        title: "Pin imported",
        description: "Successfully imported pin to database",
      });
    } catch (error) {
      console.error("Error importing pin:", error);
      toast({
        title: "Import failed",
        description: "Failed to import pin to database",
        variant: "destructive",
      });
    } finally {
      setImportingIds(prev => ({ ...prev, [item.itemId]: false }));
    }
  };

  // Helper to determine collection from title
  const determineCollection = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("star wars")) return "Star Wars";
    if (lowerTitle.includes("princess") || 
        lowerTitle.includes("ariel") || 
        lowerTitle.includes("belle") || 
        lowerTitle.includes("cinderella") || 
        lowerTitle.includes("jasmine")) return "Disney Princesses";
    if (lowerTitle.includes("villain") || 
        lowerTitle.includes("maleficent") || 
        lowerTitle.includes("ursula") || 
        lowerTitle.includes("jafar") || 
        lowerTitle.includes("evil queen")) return "Disney Villains";
    if (lowerTitle.includes("mickey") || 
        lowerTitle.includes("minnie") || 
        lowerTitle.includes("donald") || 
        lowerTitle.includes("goofy")) return "Mickey and Friends";
    if (lowerTitle.includes("haunted") || 
        lowerTitle.includes("splash") || 
        lowerTitle.includes("space") || 
        lowerTitle.includes("pirates")) return "Disney Parks";
    return "Disney Collection";
  };

  // Helper to determine category from title
  const determineCategory = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("star wars")) return "Star Wars";
    if (lowerTitle.includes("princess") || 
        lowerTitle.includes("ariel") || 
        lowerTitle.includes("belle") || 
        lowerTitle.includes("cinderella") || 
        lowerTitle.includes("jasmine")) return "Princesses";
    if (lowerTitle.includes("villain") || 
        lowerTitle.includes("maleficent") || 
        lowerTitle.includes("ursula") || 
        lowerTitle.includes("jafar") || 
        lowerTitle.includes("evil queen")) return "Villains";
    if (lowerTitle.includes("mickey") || 
        lowerTitle.includes("minnie") || 
        lowerTitle.includes("donald") || 
        lowerTitle.includes("goofy")) return "Classic Disney";
    if (lowerTitle.includes("haunted") || 
        lowerTitle.includes("splash") || 
        lowerTitle.includes("space") || 
        lowerTitle.includes("pirates")) return "Park Attractions";
    return "Disney Pins";
  };

  // Bulk import all pins from the search results
  const importAllPins = async () => {
    toast({
      title: "Bulk import started",
      description: "Importing all pins from search results...",
    });
    
    try {
      // Send search term to our cache-pins endpoint
      const response = await apiRequest(
        "GET", 
        `/api/ebay/cache-pins?q=${encodeURIComponent(searchTerm)}`
      );
      const data = await response.json();
      
      // Invalidate pins cache
      queryClient.invalidateQueries({ queryKey: ["/api/pins"] });
      
      toast({
        title: "Bulk import complete",
        description: `Successfully imported ${data.pins?.length || 0} pins`,
      });
    } catch (error) {
      console.error("Error bulk importing pins:", error);
      toast({
        title: "Bulk import failed",
        description: "Failed to import pins from eBay",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="text-3xl font-bold mb-6">eBay Pin Import Tool</h1>
      <p className="text-muted-foreground mb-8">
        Search for authentic Disney pins on eBay and import them to your database.
      </p>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search Disney pins on eBay..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} disabled={isSearching || !searchTerm}>
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            "Search eBay"
          )}
        </Button>
      </div>
      
      {searchResults.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Search Results ({searchResults.length})</h2>
            <Button onClick={importAllPins} variant="secondary">
              <Pin className="mr-2 h-4 w-4" />
              Import All Pins
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((item) => (
              <Card key={item.itemId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                  <CardDescription>
                    ${parseFloat(item.price.value).toFixed(2)} {item.price.currency}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="aspect-square overflow-hidden">
                  {item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl ? (
                    <img 
                      src={item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground">No image available</span>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => importPin(item)}
                    disabled={importingIds[item.itemId]}
                  >
                    {importingIds[item.itemId] ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Import Pin
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}