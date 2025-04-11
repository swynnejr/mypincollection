import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Pin, UserPin } from "@shared/schema";
import { Link } from "wouter";
import { PinCard } from "@/components/ui/pin-card";
import { ActivityFeed } from "@/components/ui/activity-feed";
import { MessageList } from "@/components/ui/message-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStatus } from "@/lib/protected-route";
import { AuthTooltip } from "@/components/ui/auth-tooltip";
import {
  Heart,
  RefreshCw,
  Wallet,
  Search,
  PinOff
} from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  // Fetch user pins (collection)
  const { data: userPins } = useQuery<(UserPin & { pin: Pin })[]>({
    queryKey: ["/api/user/pins"],
  });

  // Fetch pins for the "discover" section
  const { data: pins } = useQuery<Pin[]>({
    queryKey: ["/api/pins"],
  });

  // Statistics for the dashboard
  const totalPins = userPins?.length || 0;
  const collectionValue = userPins?.reduce((total, up) => total + (up.pin.currentValue || 0), 0) || 0;

  // Sample activity data (would come from API in production)
  const activities = [
    {
      id: 1,
      user: { name: "Donald Duck", avatar: "https://i.pravatar.cc/150?img=68" },
      action: "added the",
      target: { name: "Pixar's UP House Balloon", link: "/pin/5" },
      timestamp: "12 minutes ago",
      canLike: true,
      canComment: true,
    },
    {
      id: 2,
      user: { name: "Goofy", avatar: "https://i.pravatar.cc/150?img=32" },
      action: "is looking to trade their",
      target: { name: "Haunted Mansion Ghost", link: "/pin/6" },
      timestamp: "45 minutes ago",
      canLike: true,
      canComment: true,
      canTrade: true,
    },
    {
      id: 3,
      user: { name: "Minnie Mouse", avatar: "https://i.pravatar.cc/150?img=12" },
      action: "commented on your",
      target: { name: "Mickey's 90th Anniversary", link: "/pin/7" },
      comment: "This is such a beautiful pin! I've been looking for this one for my collection.",
      timestamp: "2 hours ago",
      canLike: true,
      canComment: true,
    },
  ];

  // Sample messages data (would come from API in production)
  const messages = [
    {
      id: 1,
      user: { id: 101, name: "Donald Duck", avatar: "https://i.pravatar.cc/150?img=68", isOnline: true },
      preview: "Would you be interested in trading your Mickey 50th Anniversary pin?",
      timestamp: "2m",
      isRead: false,
    },
    {
      id: 2,
      user: { id: 102, name: "Daisy Duck", avatar: "https://i.pravatar.cc/150?img=23" },
      preview: "Thanks for the information! I'll check it out.",
      timestamp: "1h",
      isRead: true,
    },
    {
      id: 3,
      user: { id: 103, name: "Chip & Dale", avatar: "https://i.pravatar.cc/150?img=45", isOnline: true },
      preview: "We have the Haunted Mansion pin you're looking for!",
      timestamp: "3h",
      isRead: true,
    },
    {
      id: 4,
      user: { id: 104, name: "Minnie Mouse", avatar: "https://i.pravatar.cc/150?img=12" },
      preview: "Looking forward to meeting at the pin trading event!",
      timestamp: "Yesterday",
      isRead: true,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {user ? "My Pin Collection" : "Disney Pin Portfolio"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your collection, discover new pins, and connect with the community
        </p>
        
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <AuthTooltip>
            <div className="bg-card border border-border shadow-sm py-2 px-4 rounded-lg flex items-center gap-2">
              <PinOff className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Total Pins</div>
                <div className="font-bold text-lg">{totalPins}</div>
              </div>
            </div>
          </AuthTooltip>
          
          <AuthTooltip>
            <div className="bg-card border border-border shadow-sm py-2 px-4 rounded-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Want List</div>
                <div className="font-bold text-lg">32</div>
              </div>
            </div>
          </AuthTooltip>
          
          <AuthTooltip>
            <div className="bg-card border border-border shadow-sm py-2 px-4 rounded-lg flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Active Trades</div>
                <div className="font-bold text-lg">5</div>
              </div>
            </div>
          </AuthTooltip>
          
          <AuthTooltip>
            <div className="bg-card border border-border shadow-sm py-2 px-4 rounded-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Collection Value</div>
                <div className="font-bold text-lg">${collectionValue.toFixed(2)}</div>
              </div>
            </div>
          </AuthTooltip>
        </div>
      </div>
      
      {/* Collection Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <AuthTooltip>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="default">All Pins</Button>
              <Button variant="outline">Limited Edition</Button>
              <Button variant="outline">Classic Disney</Button>
              <Button variant="outline">Star Wars</Button>
              <Button variant="outline">Marvel</Button>
            </div>
          </AuthTooltip>
          
          <AuthTooltip>
            <div className="flex items-center gap-2">
              <span className="text-sm">Sort by:</span>
              <Select defaultValue="recently-added">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recently-added">Recently Added</SelectItem>
                  <SelectItem value="highest-value">Highest Value</SelectItem>
                  <SelectItem value="oldest-first">Oldest First</SelectItem>
                  <SelectItem value="a-z">A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AuthTooltip>
        </div>
      </div>
      
      {/* Pin Collection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {pins && pins.slice(0, 4).map((pin) => (
          <PinCard 
            key={pin.id} 
            pin={pin} 
            stats={{ 
              haveCount: Math.floor(Math.random() * 1000), 
              wantCount: Math.floor(Math.random() * 500)
            }}
          />
        ))}
      </div>
      
      {/* Recent Activity & Messages Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <AuthTooltip>
            <ActivityFeed 
              activities={activities} 
              viewAllLink="/activity"
            />
          </AuthTooltip>
        </div>
        
        {/* Messages */}
        <div>
          <AuthTooltip>
            <MessageList 
              messages={messages} 
              viewAllLink="/messages"
              onNewMessage={() => alert("New message")}
            />
          </AuthTooltip>
        </div>
      </div>
      
      {/* Discover Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Discover Popular Pins</h2>
          <Link href="/discover" className="text-sm text-primary">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {pins && pins.slice(0, 5).map((pin) => (
            <div key={pin.id} className="bg-card border border-border rounded-xl overflow-hidden group">
              <div className="relative">
                <img 
                  src={pin.imageUrl} 
                  alt={pin.name} 
                  className="w-full aspect-square object-cover group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/pin/${pin.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
                {pin.isLimitedEdition && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="text-xs">Trending</Badge>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm truncate">{pin.name}</h3>
                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-muted-foreground">
                    {Math.floor(Math.random() * 1000) + 100} have
                  </span>
                  <span className="font-medium text-primary">
                    ${pin.currentValue?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Upcoming Events */}
      <div className="bg-card border border-border rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Upcoming Pin Events</h2>
          <Link href="/events" className="text-sm text-primary">
            View Calendar
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 1,
              month: "APR",
              day: "28",
              title: "Disney Pin Trading Night",
              location: "Magic Kingdom, Orlando, FL",
              time: "7:00 PM - 10:00 PM",
              attendees: 25
            },
            {
              id: 2,
              month: "MAY",
              day: "15",
              title: "Star Wars Pin Release",
              location: "Disney Springs, Orlando, FL",
              time: "9:00 AM - 12:00 PM",
              attendees: 42
            },
            {
              id: 3,
              month: "JUN",
              day: "10",
              title: "Collector's Convention",
              location: "Anaheim Convention Center, CA",
              time: "All Day Event",
              attendees: 118
            }
          ].map(event => (
            <div key={event.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg flex flex-col items-center justify-center bg-primary text-primary-foreground">
                  <span className="text-xs font-medium">{event.month}</span>
                  <span className="text-lg font-bold leading-none">{event.day}</span>
                </div>
                <div>
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{event.location}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-background">{event.time}</span>
                    <Badge variant="default" className="text-xs">{event.attendees} Going</Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}