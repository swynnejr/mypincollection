import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Pin, PinPriceHistory } from "@shared/schema";
import { Sidebar, MobileSidebar } from "@/components/ui/sidebar";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { PriceHistoryChart } from "@/components/ui/price-history-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PinOff,
  Search,
  Bell,
  MessageSquare,
  Heart,
  Share,
  User,
  ArrowUp,
  ArrowDown,
  Info,
  Calendar,
  DollarSign,
  Tag,
  AlertTriangle,
} from "lucide-react";

export default function PinDetailPage() {
  const { id } = useParams<{ id: string }>();
  const pinId = parseInt(id);
  const { user } = useAuth();
  const { toast } = useToast();

  // Query pin data
  const { data: pin, isLoading: isPinLoading } = useQuery<Pin>({
    queryKey: [`/api/pins/${pinId}`],
  });

  // Query pin statistics
  const { data: stats, isLoading: isStatsLoading } = useQuery<{ haveCount: number; wantCount: number }>({
    queryKey: [`/api/pins/${pinId}/stats`],
  });

  // Query price history
  const { data: priceHistory, isLoading: isPriceHistoryLoading } = useQuery<PinPriceHistory[]>({
    queryKey: [`/api/pins/${pinId}/price-history`],
  });

  // Query user pins to check if user has this pin in their collection
  const { data: userPins } = useQuery<{ pinId: number }[]>({
    queryKey: ["/api/user/pins"],
  });

  // Query user want list to check if user wants this pin
  const { data: userWantList } = useQuery<{ pinId: number }[]>({
    queryKey: ["/api/user/wantlist"],
  });

  const inCollection = userPins?.some(userPin => userPin.pinId === pinId) || false;
  const inWantList = userWantList?.some(item => item.pinId === pinId) || false;

  // Add to collection mutation
  const addToCollectionMutation = useMutation({
    mutationFn: async () => {
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

  // Remove from collection mutation
  const removeFromCollectionMutation = useMutation({
    mutationFn: async () => {
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

  // Add to want list mutation
  const addToWantListMutation = useMutation({
    mutationFn: async () => {
      const data = { pinId, priority: 1 };
      const res = await apiRequest("POST", "/api/user/wantlist", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/wantlist"] });
      toast({
        title: "Success",
        description: "Pin added to your want list",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add pin to want list: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Remove from want list mutation
  const removeFromWantListMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/user/wantlist/${pinId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/wantlist"] });
      toast({
        title: "Success",
        description: "Pin removed from your want list",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to remove pin from want list: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  if (isPinLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
      </div>
    );
  }

  if (!pin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Pin Not Found</h1>
          <p className="text-muted-foreground">The pin you are looking for does not exist.</p>
          <Button asChild>
            <Link href="/collection">
              <a>Back to Collection</a>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate price change (based on price history data)
  const priceChange = (() => {
    if (!priceHistory || priceHistory.length < 2) return { amount: 0, percentage: 0, isPositive: false };
    
    const sortedHistory = [...priceHistory].sort((a, b) => 
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    );
    
    if (sortedHistory.length < 2) return { amount: 0, percentage: 0, isPositive: false };
    
    const latestPrice = sortedHistory[0].price;
    const previousPrice = sortedHistory[1].price;
    const difference = latestPrice - previousPrice;
    const percentage = (difference / previousPrice) * 100;
    
    return {
      amount: difference,
      percentage: percentage,
      isPositive: difference >= 0
    };
  })();

  // Format release date
  const formattedReleaseDate = pin.releaseDate 
    ? new Date(pin.releaseDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Unknown';

  // Similar pins (just for display - would be fetched from an API in production)
  const similarPins = [
    { id: 5, name: 'Mickey 60th Anniversary', imageUrl: 'https://images.unsplash.com/photo-1559909172-3a1fb7489261', currentValue: 48.99 },
    { id: 6, name: 'Donald Duck Classic', imageUrl: 'https://images.unsplash.com/photo-1590086783191-a0694c7d1e6e', currentValue: 32.50 },
    { id: 7, name: 'Minnie Mouse Bow Collection', imageUrl: 'https://images.unsplash.com/photo-1610041321420-a596dd6de15a', currentValue: 29.99 },
  ];

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
                <input
                  type="text" 
                  placeholder="Search pins, collections, users..." 
                  className="w-full py-2 px-10 rounded-full text-sm bg-card border border-border"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-full hover:bg-primary/10 transition-colors">
                <Bell className="h-5 w-5" />
                <Badge className="absolute top-0 right-0 h-4 w-4 p-0 flex items-center justify-center text-[10px]">3</Badge>
              </button>
              
              <button className="relative p-2 rounded-full hover:bg-primary/10 transition-colors">
                <MessageSquare className="h-5 w-5" />
                <Badge className="absolute top-0 right-0 h-4 w-4 p-0 flex items-center justify-center text-[10px]">2</Badge>
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
              <input
                type="text" 
                placeholder="Search pins, collections..." 
                className="w-full py-2 px-10 rounded-full text-sm bg-card border border-border"
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
            {/* Breadcrumb */}
            <div className="mb-6">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                  <li className="inline-flex items-center">
                    <Link href="/">
                      <a className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                        Home
                      </a>
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <span className="mx-2 text-muted-foreground">/</span>
                      <Link href="/collection">
                        <a className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                          Collection
                        </a>
                      </Link>
                    </div>
                  </li>
                  <li aria-current="page">
                    <div className="flex items-center">
                      <span className="mx-2 text-muted-foreground">/</span>
                      <span className="text-sm text-foreground">{pin.name}</span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
            
            {/* Pin Detail Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Pin Image */}
              <div className="lg:col-span-1">
                <div className="relative bg-card rounded-xl overflow-hidden border border-border">
                  <img 
                    src={pin.imageUrl} 
                    alt={pin.name} 
                    className="w-full aspect-square object-cover"
                  />
                  {pin.isLimitedEdition && (
                    <div className="absolute top-4 left-4">
                      <Badge className="text-sm">Limited Edition</Badge>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button 
                      onClick={() => inWantList ? removeFromWantListMutation.mutate() : addToWantListMutation.mutate()}
                      className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all"
                      style={{ color: inWantList ? 'var(--color-primary)' : 'rgb(156, 163, 175)' }}
                    >
                      <Heart className="h-5 w-5" fill={inWantList ? 'currentColor' : 'none'} />
                    </button>
                    <button 
                      className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all text-gray-700"
                    >
                      <Share className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <Button 
                    onClick={() => inCollection ? removeFromCollectionMutation.mutate() : addToCollectionMutation.mutate()}
                    variant={inCollection ? "outline" : "default"}
                    className="flex-1"
                  >
                    {inCollection ? (
                      <>
                        <PinOff className="mr-2 h-4 w-4" />
                        Remove from Collection
                      </>
                    ) : (
                      <>
                        <PinOff className="mr-2 h-4 w-4" />
                        Add to Collection
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => inWantList ? removeFromWantListMutation.mutate() : addToWantListMutation.mutate()}
                    variant={inWantList ? "outline" : "secondary"}
                    className="flex-1"
                  >
                    {inWantList ? (
                      <>
                        <Heart className="mr-2 h-4 w-4" fill="currentColor" />
                        Remove from Want List
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-4 w-4" />
                        Add to Want List
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Community Stats */}
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Community Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>Collectors who have this pin</span>
                        </div>
                        <span className="font-medium">{stats?.haveCount || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-muted-foreground" />
                          <span>Collectors who want this pin</span>
                        </div>
                        <span className="font-medium">{stats?.wantCount || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Pin Details */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">{pin.name}</h1>
                    <p className="text-lg text-muted-foreground">{pin.collection}</p>
                    
                    <div className="flex flex-wrap gap-3 mt-4">
                      {pin.category && (
                        <Badge variant="secondary">{pin.category}</Badge>
                      )}
                      {pin.isLimitedEdition && (
                        <Badge>Limited Edition</Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Price Information */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Current Market Value</CardTitle>
                      <CardDescription>Updated from eBay Product Research API</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl font-bold text-primary">${pin.currentValue?.toFixed(2)}</span>
                        {priceChange.amount !== 0 && (
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                            priceChange.isPositive 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {priceChange.isPositive ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )}
                            <span>${Math.abs(priceChange.amount).toFixed(2)}</span>
                            <span>({Math.abs(priceChange.percentage).toFixed(1)}%)</span>
                          </div>
                        )}
                      </div>
                      
                      <PriceHistoryChart pinId={pin.id} pinName={pin.name} />
                    </CardContent>
                  </Card>
                  
                  {/* Tabs for additional information */}
                  <Tabs defaultValue="details">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="description">Description</TabsTrigger>
                      <TabsTrigger value="owners">Owners</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="details">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <div>
                                  <h3 className="font-medium">Collection</h3>
                                  <p className="text-sm text-muted-foreground">{pin.collection || "Unknown"}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <div>
                                  <h3 className="font-medium">Release Date</h3>
                                  <p className="text-sm text-muted-foreground">{formattedReleaseDate}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <DollarSign className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <div>
                                  <h3 className="font-medium">Value Trend</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {priceChange.isPositive
                                      ? `Up ${Math.abs(priceChange.percentage).toFixed(1)}% in last 30 days`
                                      : priceChange.amount === 0
                                      ? "Stable in last 30 days"
                                      : `Down ${Math.abs(priceChange.percentage).toFixed(1)}% in last 30 days`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <Tag className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <div>
                                  <h3 className="font-medium">Category</h3>
                                  <p className="text-sm text-muted-foreground">{pin.category || "Uncategorized"}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="description">
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {pin.description || "No description available for this pin."}
                          </p>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="owners">
                      <Card>
                        <CardContent className="pt-6">
                          {isStatsLoading ? (
                            <div className="text-center py-4">
                              <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                              <p className="text-muted-foreground">Loading owner data...</p>
                            </div>
                          ) : (
                            <>
                              <p className="mb-4">
                                This pin is owned by <span className="font-medium">{stats?.haveCount || 0}</span> collectors
                                and wanted by <span className="font-medium">{stats?.wantCount || 0}</span> collectors.
                              </p>
                              
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-medium">Ownership Rate</h3>
                                  <span className="text-sm">{Math.round((stats?.haveCount || 0) / ((stats?.haveCount || 0) + (stats?.wantCount || 1)) * 100)}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2.5">
                                  <div 
                                    className="bg-primary h-2.5 rounded-full" 
                                    style={{ width: `${Math.round((stats?.haveCount || 0) / ((stats?.haveCount || 0) + (stats?.wantCount || 1)) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
            
            {/* Similar Pins */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Similar Pins</h2>
                <Link href="/discover">
                  <a className="text-sm text-primary">View More</a>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {similarPins.map((similarPin) => (
                  <Link key={similarPin.id} href={`/pin/${similarPin.id}`}>
                    <a className="bg-card border border-border rounded-xl overflow-hidden group">
                      <div className="relative">
                        <img 
                          src={similarPin.imageUrl} 
                          alt={similarPin.name} 
                          className="w-full aspect-square object-cover group-hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="sm" variant="secondary">View Details</Button>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm truncate">{similarPin.name}</h3>
                        <div className="flex justify-between items-center text-xs mt-1">
                          <span className="text-muted-foreground">
                            {Math.floor(Math.random() * 900) + 100} have
                          </span>
                          <span className="font-medium text-primary">
                            ${similarPin.currentValue?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
