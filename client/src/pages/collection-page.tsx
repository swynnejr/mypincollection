import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Pin, UserPin, insertUserPinSchema } from "@shared/schema";
import { useState } from "react";
import { Link } from "wouter";
import { Sidebar, MobileSidebar } from "@/components/ui/sidebar";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { PinCard } from "@/components/ui/pin-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PinOff,
  Search,
  Bell,
  MessageSquare,
  Plus,
  Filter,
} from "lucide-react";

export default function CollectionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recently-added");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user pins (collection)
  const { data: userPins, isLoading: isLoadingUserPins } = useQuery<(UserPin & { pin: Pin })[]>({
    queryKey: ["/api/user/pins"],
  });

  // Fetch all pins for adding to collection
  const { data: allPins, isLoading: isLoadingAllPins } = useQuery<Pin[]>({
    queryKey: ["/api/pins"],
  });

  // Mutation to add pin to collection
  const addToCollectionMutation = useMutation({
    mutationFn: async (pinId: number) => {
      const data = { pinId };
      const res = await apiRequest("POST", "/api/user/pins", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/pins"] });
      toast({
        title: "Success",
        description: "Pin added to your collection",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add pin: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation to remove pin from collection
  const removeFromCollectionMutation = useMutation({
    mutationFn: async (pinId: number) => {
      await apiRequest("DELETE", `/api/user/pins/${pinId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/pins"] });
      toast({
        title: "Success",
        description: "Pin removed from your collection",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to remove pin: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter pins based on category and search query
  const filteredPins = userPins?.filter(userPin => {
    const pin = userPin.pin;
    const matchesFilter = 
      filter === "all" || 
      (filter === "limited-edition" && pin.isLimitedEdition) || 
      (pin.category?.toLowerCase() === filter);
    
    const matchesSearch = 
      !searchQuery || 
      pin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.collection?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Sort pins
  const sortedPins = [...(filteredPins || [])].sort((a, b) => {
    switch (sortBy) {
      case "highest-value":
        return (b.pin.currentValue || 0) - (a.pin.currentValue || 0);
      case "lowest-value":
        return (a.pin.currentValue || 0) - (b.pin.currentValue || 0);
      case "oldest-first":
        return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      case "a-z":
        return a.pin.name.localeCompare(b.pin.name);
      case "recently-added":
      default:
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    }
  });

  // Get pins not in collection for add dialog
  const pinsNotInCollection = allPins?.filter(pin => 
    !userPins?.some(userPin => userPin.pinId === pin.id)
  ) || [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MobileSidebar />
              <Link href="/">
                <a className="flex items-center gap-2">
                  <PinOff className="h-6 w-6 text-primary" />
                  <h1 className="text-xl font-bold">Pin Portfolio</h1>
                </a>
              </Link>
            </div>
            
            <div className="hidden md:block flex-1 max-w-md mx-4">
              <div className="relative">
                <Input
                  type="text" 
                  placeholder="Search your pin collection..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-full hover:bg-primary/10 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 text-xs bg-primary text-white rounded-full h-4 w-4 flex items-center justify-center">3</span>
              </button>
              
              <button className="relative p-2 rounded-full hover:bg-primary/10 transition-colors">
                <MessageSquare className="h-5 w-5" />
                <span className="absolute top-0 right-0 text-xs bg-primary text-white rounded-full h-4 w-4 flex items-center justify-center">2</span>
              </button>
              
              <ThemeSelector />
              
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={user?.avatarUrl || "https://i.pravatar.cc/150?img=32"} alt={user?.displayName || user?.username || "User"} />
                  <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden md:inline">
                  {user?.displayName || user?.username}
                </span>
              </div>
            </div>
          </div>
          
          <div className="md:hidden mt-3">
            <div className="relative">
              <Input
                type="text" 
                placeholder="Search your pin collection..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex relative">
        {/* Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            {/* Collection Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">My Pin Collection</h1>
                <p className="text-sm text-muted-foreground">
                  {userPins?.length || 0} pins in your collection • Total value: ${
                    (userPins?.reduce((sum, up) => sum + (up.pin.currentValue || 0), 0) || 0).toFixed(2)
                  }
                </p>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="md:self-start">
                    <Plus className="mr-2 h-4 w-4" /> Add Pin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Pin to Collection</DialogTitle>
                    <DialogDescription>
                      Select a pin to add to your collection.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[60vh] overflow-y-auto space-y-4 my-4">
                    {isLoadingAllPins ? (
                      <div className="text-center py-8">Loading pins...</div>
                    ) : pinsNotInCollection.length === 0 ? (
                      <div className="text-center py-8">No more pins available to add</div>
                    ) : (
                      pinsNotInCollection.map(pin => (
                        <div 
                          key={pin.id} 
                          className="flex items-center gap-3 p-2 border border-border rounded-md"
                        >
                          <img 
                            src={pin.imageUrl} 
                            alt={pin.name} 
                            className="w-12 h-12 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{pin.name}</h3>
                            <p className="text-xs text-muted-foreground">{pin.collection}</p>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => addToCollectionMutation.mutate(pin.id)}
                            disabled={addToCollectionMutation.isPending}
                          >
                            Add
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button variant="outline">Close</Button>
                    </DialogTrigger>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Collection Filters */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    variant={filter === "all" ? "default" : "outline"}
                    onClick={() => setFilter("all")}
                  >
                    All Pins
                  </Button>
                  <Button 
                    variant={filter === "limited-edition" ? "default" : "outline"}
                    onClick={() => setFilter("limited-edition")}
                  >
                    Limited Edition
                  </Button>
                  <Button 
                    variant={filter === "classic disney" ? "default" : "outline"}
                    onClick={() => setFilter("classic disney")}
                  >
                    Classic Disney
                  </Button>
                  <Button 
                    variant={filter === "star wars" ? "default" : "outline"}
                    onClick={() => setFilter("star wars")}
                  >
                    Star Wars
                  </Button>
                  <Button 
                    variant={filter === "marvel" ? "default" : "outline"}
                    onClick={() => setFilter("marvel")}
                  >
                    Marvel
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recently-added">Recently Added</SelectItem>
                      <SelectItem value="highest-value">Highest Value</SelectItem>
                      <SelectItem value="lowest-value">Lowest Value</SelectItem>
                      <SelectItem value="oldest-first">Oldest First</SelectItem>
                      <SelectItem value="a-z">A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Pin Collection Grid */}
            {isLoadingUserPins ? (
              <div className="text-center py-16">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Loading your collection...</p>
              </div>
            ) : sortedPins?.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-lg border border-border">
                <PinOff className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Your collection is empty</h2>
                <p className="text-muted-foreground mb-6">Start building your pin collection today</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Add Your First Pin
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    {/* Same dialog content as above */}
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedPins.map((userPin) => (
                  <PinCard 
                    key={userPin.id} 
                    pin={userPin.pin} 
                    inCollection={true}
                    stats={{ 
                      haveCount: Math.floor(Math.random() * 1000), 
                      wantCount: Math.floor(Math.random() * 500)
                    }}
                    onToggleCollection={() => removeFromCollectionMutation.mutate(userPin.pinId)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
