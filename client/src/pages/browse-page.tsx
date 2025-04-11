import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Pin } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PinOff, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AuthTooltip } from "@/components/ui/auth-tooltip";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export default function BrowsePage(): React.ReactElement {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  
  // Fetch all pins
  const { data: pins, isLoading } = useQuery<Pin[]>({
    queryKey: ["/api/pins"],
  });
  
  // Fetch user's collection to know which pins they already have
  const { data: userPins } = useQuery<any[]>({
    queryKey: ["/api/user/pins"],
    enabled: !!user,
  });
  
  // Fetch user's want list to know which pins they already want
  const { data: wantList } = useQuery<any[]>({
    queryKey: ["/api/user/wantlist"],
    enabled: !!user,
  });
  
  // Extract all unique categories and collections for filtering
  const categories = React.useMemo(() => {
    if (!pins) return [];
    return Array.from(new Set(pins.map(pin => pin.category).filter(Boolean))) as string[];
  }, [pins]);
  
  const collections = React.useMemo(() => {
    if (!pins) return [];
    return Array.from(new Set(pins.map(pin => pin.collection).filter(Boolean))) as string[];
  }, [pins]);
  
  // Filter pins based on search and filters
  const filteredPins = React.useMemo(() => {
    if (!pins) return [];
    
    return pins.filter(pin => {
      // Filter by search term
      const matchesSearch = 
        searchTerm === "" || 
        pin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pin.description && pin.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by selected categories
      const matchesCategory = 
        selectedCategories.length === 0 || 
        (pin.category && selectedCategories.includes(pin.category));
        
      // Filter by selected collections
      const matchesCollection = 
        selectedCollections.length === 0 || 
        (pin.collection && selectedCollections.includes(pin.collection));
        
      return matchesSearch && matchesCategory && matchesCollection;
    });
  }, [pins, searchTerm, selectedCategories, selectedCollections]);
  
  // Check if pin is in user's collection
  const isPinInCollection = (pinId: number) => {
    if (!userPins) return false;
    return userPins.some(userPin => userPin.pinId === pinId);
  };
  
  // Check if pin is in user's want list
  const isPinInWantList = (pinId: number) => {
    if (!wantList) return false;
    return wantList.some(item => item.pinId === pinId);
  };
  
  // Add pin to collection
  const addToCollection = async (pinId: number) => {
    try {
      await apiRequest("POST", "/api/user/pins", { pinId });
      toast({
        title: "Success",
        description: "Pin added to your collection",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add pin to collection",
        variant: "destructive",
      });
    }
  };
  
  // Add pin to want list
  const addToWantList = async (pinId: number) => {
    try {
      await apiRequest("POST", "/api/user/wantlist", { pinId });
      toast({
        title: "Success",
        description: "Pin added to your want list",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add pin to want list",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Browse Disney Pins</h1>
          <p className="text-muted-foreground mt-1">
            Explore our collection of authentic Disney pins
          </p>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search pins..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {(selectedCategories.length > 0 || selectedCollections.length > 0) && (
                <Badge className="ml-2">
                  {selectedCategories.length + selectedCollections.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Categories</h4>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`category-${category}`} 
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([...selectedCategories, category]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== category));
                          }
                        }}
                      />
                      <Label htmlFor={`category-${category}`} className="text-sm">{category}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Collections</h4>
                <div className="grid grid-cols-1 gap-2">
                  {collections.map(collection => (
                    <div key={collection} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`collection-${collection}`} 
                        checked={selectedCollections.includes(collection)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCollections([...selectedCollections, collection]);
                          } else {
                            setSelectedCollections(selectedCollections.filter(c => c !== collection));
                          }
                        }}
                      />
                      <Label htmlFor={`collection-${collection}`} className="text-sm">{collection}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {(selectedCategories.length > 0 || selectedCollections.length > 0) && (
                <Button 
                  variant="link" 
                  className="px-0" 
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedCollections([]);
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredPins.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No pins found matching your filters.</p>
          {(searchTerm || selectedCategories.length > 0 || selectedCollections.length > 0) && (
            <Button 
              variant="link" 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategories([]);
                setSelectedCollections([]);
              }}
            >
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPins.map((pin) => (
            <Card key={pin.id} className="overflow-hidden flex flex-col h-full">
              <div className="aspect-square overflow-hidden">
                {pin.imageUrl ? (
                  <img 
                    src={pin.imageUrl} 
                    alt={pin.name} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <PinOff className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                )}
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {pin.category && (
                    <Badge variant="secondary" className="text-xs">
                      {pin.category}
                    </Badge>
                  )}
                  {pin.isLimitedEdition && (
                    <Badge variant="default" className="text-xs">
                      Limited Edition
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg leading-tight">
                  <Link href={`/pin/${pin.id}`} className="hover:underline">
                    {pin.name}
                  </Link>
                </CardTitle>
                {pin.collection && (
                  <CardDescription>
                    {pin.collection}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="pb-2 flex-grow">
                {pin.description && (
                  <p className="text-sm line-clamp-2 text-muted-foreground">
                    {pin.description}
                  </p>
                )}
              </CardContent>
              
              <CardFooter className="pt-2 flex justify-between items-center">
                <div className="font-semibold">
                  ${pin.currentValue?.toFixed(2) || "N/A"}
                </div>
                
                <div className="flex gap-2">
                  {user ? (
                    <>
                      <Button 
                        size="sm" 
                        variant={isPinInCollection(pin.id) ? "secondary" : "outline"}
                        onClick={() => !isPinInCollection(pin.id) && addToCollection(pin.id)}
                        disabled={isPinInCollection(pin.id)}
                      >
                        {isPinInCollection(pin.id) ? "In Collection" : "Add"}
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant={isPinInWantList(pin.id) ? "secondary" : "outline"}
                        onClick={() => !isPinInWantList(pin.id) && addToWantList(pin.id)}
                        disabled={isPinInWantList(pin.id)}
                      >
                        {isPinInWantList(pin.id) ? "In Want List" : "Want"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <AuthTooltip disabledContent="Login to add to collection">
                        <Button size="sm" variant="outline" disabled>
                          Add
                        </Button>
                      </AuthTooltip>
                      
                      <AuthTooltip disabledContent="Login to add to want list">
                        <Button size="sm" variant="outline" disabled>
                          Want
                        </Button>
                      </AuthTooltip>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}