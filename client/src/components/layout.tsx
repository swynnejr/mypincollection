import { ReactNode } from "react";
import { Sidebar, MobileSidebar } from "@/components/ui/sidebar";
import { useAuthStatus } from "@/lib/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { Bell, MessageSquare, PinOff, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoginButton } from "@/components/ui/auth-tooltip";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="border-b border-border h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MobileSidebar />
            <Link href="/" className="flex items-center gap-2">
              <PinOff className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold hidden sm:inline-block">Pin Portfolio</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeSelector />
            
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full text-xs w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                </Button>
                
                <Button variant="ghost" size="icon" className="relative">
                  <MessageSquare className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full text-xs w-4 h-4 flex items-center justify-center">
                    2
                  </span>
                </Button>
                
                <Link href="/profile">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={user?.avatarUrl || ""} alt={user?.displayName || ""} />
                    <AvatarFallback>
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </>
            ) : (
              <LoginButton />
            )}
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}