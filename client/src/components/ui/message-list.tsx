import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageItem {
  id: number;
  user: {
    id: number;
    name: string;
    avatar: string;
    isOnline?: boolean;
  };
  preview: string;
  timestamp: string;
  isRead: boolean;
}

interface MessageListProps {
  messages: MessageItem[];
  title?: string;
  viewAllLink?: string;
  onNewMessage?: () => void;
}

export function MessageList({
  messages,
  title = "Messages",
  viewAllLink,
  onNewMessage
}: MessageListProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between py-5">
        <CardTitle className="text-xl">{title}</CardTitle>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-sm text-primary">
            View All
          </Link>
        )}
      </CardHeader>
      
      <CardContent className="space-y-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquarePlus className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground">Start a conversation with another collector</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem 
              key={message.id} 
              message={message} 
            />
          ))
        )}
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          onClick={onNewMessage} 
          className="w-full flex items-center justify-center gap-2"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span>New Message</span>
        </Button>
      </CardFooter>
    </Card>
  );
}

function MessageItem({ message }: { message: MessageItem }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Link 
      href={`/messages/${message.user.id}`}
      className={cn(
        "flex items-center gap-3 py-3 border-b border-border cursor-pointer hover:bg-background/50 transition-colors rounded px-2",
        !message.isRead && "bg-background/30"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={message.user.avatar} alt={message.user.name} />
          <AvatarFallback>{message.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        {message.user.isOnline && (
          <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-card"></span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={cn(
            "text-sm truncate",
            !message.isRead && "font-medium"
          )}>
            {message.user.name}
          </h3>
          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
        </div>
        <p className={cn(
          "text-xs truncate",
          message.isRead ? "text-muted-foreground" : "text-foreground"
        )}>
          {message.preview}
        </p>
      </div>
    </Link>
  );
}
