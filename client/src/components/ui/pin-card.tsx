import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Heart, 
  HeartCrack, 
  Share,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Pin } from "@shared/schema";
import { PriceChart } from "@/components/ui/price-chart";
import { Badge } from "@/components/ui/badge";
import { AuthTooltip } from "@/components/ui/auth-tooltip";
import { useAuthStatus } from "@/lib/protected-route";

interface PinCardProps {
  pin: Pin;
  stats?: { haveCount: number; wantCount: number };
  inCollection?: boolean;
  inWantList?: boolean;
  onToggleCollection?: () => void;
  onToggleWantList?: () => void;
  className?: string;
}

export function PinCard({
  pin,
  stats = { haveCount: 0, wantCount: 0 },
  inCollection = false,
  inWantList = false,
  onToggleCollection,
  onToggleWantList,
  className
}: PinCardProps) {
  const { 
    id, 
    name, 
    collection, 
    imageUrl, 
    currentValue, 
    category,
    isLimitedEdition
  } = pin;

  const [isHovering, setIsHovering] = useState(false);
  const isAuthenticated = useAuthStatus();

  // Calculate price change (mock data for now)
  const priceChange = {
    amount: (Math.random() * 10 - 5).toFixed(2),
    percentage: (Math.random() * 20 - 10).toFixed(1),
    isPositive: Math.random() > 0.5
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:translate-y-[-4px]",
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative">
        <Link href={`/pin/${id}`} className="block">
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full aspect-square object-cover"
          />
        </Link>
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <AuthTooltip disabledContent="Login to add pins to your want list">
            <button 
              onClick={(e) => {
                e.preventDefault();
                onToggleWantList?.();
              }}
              className="bg-white bg-opacity-80 p-1.5 rounded-full hover:bg-opacity-100 transition-all"
              style={{ color: inWantList ? 'var(--color-primary)' : 'rgb(156, 163, 175)' }}
            >
              {inWantList ? <HeartCrack className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
            </button>
          </AuthTooltip>
          <AuthTooltip disabledContent="Login to share this pin">
            <button className="bg-white bg-opacity-80 p-1.5 rounded-full text-gray-700 hover:bg-opacity-100 transition-all">
              <Share className="h-4 w-4" />
            </button>
          </AuthTooltip>
        </div>
        <div className="absolute bottom-2 left-2">
          {isLimitedEdition && (
            <Badge variant="default" className="text-xs px-2 py-1">Limited Edition</Badge>
          )}
          {category && !isLimitedEdition && (
            <Badge variant="secondary" className="text-xs px-2 py-1">{category}</Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold mb-1 text-base">{name}</h3>
        <p className="text-sm text-muted-foreground mb-3">{collection}</p>
        
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold text-lg text-primary">${currentValue?.toFixed(2)}</span>
          {priceChange.amount !== "0.00" && (
            <span className={cn(
              "text-xs px-2 py-1 rounded-full",
              priceChange.isPositive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            )}>
              {priceChange.isPositive ? "↑" : "↓"} ${Math.abs(Number(priceChange.amount))} ({priceChange.percentage}%)
            </span>
          )}
        </div>
        
        <div className="h-[80px] mb-3">
          <PriceChart pinId={id} />
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-2 border-t flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <User className="h-4 w-4" />
          <span>{stats.haveCount} have</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart className="h-4 w-4" />
          <span>{stats.wantCount} want</span>
        </div>
      </CardFooter>
    </Card>
  );
}
