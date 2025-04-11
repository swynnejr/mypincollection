import { useState, forwardRef } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  PinOff,
  Heart,
  RefreshCw,
  Wallet,
  Compass,
  Users,
  Calendar,
  Store,
  GalleryVerticalEnd,
  Rocket,
  Shield,
  Film,
  WandSparkles,
  UserCog,
  MessagesSquare,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ mobile = false, onClose }, ref) => {
    const [location] = useLocation();
    const { user } = useAuth();

    const MenuItem = ({
      href,
      icon: Icon,
      label,
      active,
    }: {
      href: string;
      icon: React.ElementType;
      label: string;
      active?: boolean;
    }) => {
      return (
        <li>
          <Link href={href}>
            <a
              className={cn(
                "flex items-center gap-2 py-2 px-3 rounded hover:bg-primary/10 transition-colors",
                active && "text-primary font-semibold"
              )}
              onClick={() => mobile && onClose?.()}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </a>
          </Link>
        </li>
      );
    };

    return (
      <aside
        ref={ref}
        className="w-64 h-screen sticky top-0 flex-shrink-0 bg-card border-r border-border"
      >
        <ScrollArea className="h-full px-4 py-6">
          <nav className="space-y-6">
            <div>
              <h3 className="text-xs uppercase font-bold mb-2 opacity-70">
                My Collection
              </h3>
              <ul className="space-y-1">
                <MenuItem
                  href="/"
                  icon={LayoutDashboard}
                  label="Dashboard"
                  active={location === "/"}
                />
                <MenuItem
                  href="/collection"
                  icon={PinOff}
                  label="My Pins"
                  active={location === "/collection"}
                />
                <MenuItem
                  href="/wantlist"
                  icon={Heart}
                  label="Want List"
                  active={location === "/wantlist"}
                />
                <MenuItem
                  href="/trades"
                  icon={RefreshCw}
                  label="Trades"
                  active={location === "/trades"}
                />
                <MenuItem
                  href="/value-tracker"
                  icon={Wallet}
                  label="Value Tracker"
                  active={location === "/value-tracker"}
                />
              </ul>
            </div>

            <div>
              <h3 className="text-xs uppercase font-bold mb-2 opacity-70">
                Discover
              </h3>
              <ul className="space-y-1">
                <MenuItem
                  href="/browse"
                  icon={Compass}
                  label="Browse Pins"
                  active={location === "/browse"}
                />
                <MenuItem
                  href="/community"
                  icon={Users}
                  label="Community"
                  active={location === "/community"}
                />
                <MenuItem
                  href="/events"
                  icon={Calendar}
                  label="Events"
                  active={location === "/events"}
                />
                <MenuItem
                  href="/marketplace"
                  icon={Store}
                  label="Marketplace"
                  active={location === "/marketplace"}
                />
              </ul>
            </div>

            <div>
              <h3 className="text-xs uppercase font-bold mb-2 opacity-70">
                Pin Categories
              </h3>
              <ul className="space-y-1">
                <MenuItem
                  href="/category/disney"
                  icon={GalleryVerticalEnd}
                  label="Classic Disney"
                  active={location === "/category/disney"}
                />
                <MenuItem
                  href="/category/star-wars"
                  icon={Rocket}
                  label="Star Wars"
                  active={location === "/category/star-wars"}
                />
                <MenuItem
                  href="/category/marvel"
                  icon={Shield}
                  label="Marvel"
                  active={location === "/category/marvel"}
                />
                <MenuItem
                  href="/category/pixar"
                  icon={Film}
                  label="Pixar"
                  active={location === "/category/pixar"}
                />
                <MenuItem
                  href="/category/limited"
                  icon={WandSparkles}
                  label="Limited Edition"
                  active={location === "/category/limited"}
                />
              </ul>
            </div>

            <div>
              <h3 className="text-xs uppercase font-bold mb-2 opacity-70">
                Account
              </h3>
              <ul className="space-y-1">
                <MenuItem
                  href="/settings"
                  icon={UserCog}
                  label="Profile Settings"
                  active={location === "/settings"}
                />
                <MenuItem
                  href="/messages"
                  icon={MessagesSquare}
                  label="Messages"
                  active={location === "/messages"}
                />
                <MenuItem
                  href="/preferences"
                  icon={Settings}
                  label="Preferences"
                  active={location === "/preferences"}
                />
                <MenuItem
                  href="/support"
                  icon={HelpCircle}
                  label="Help & Support"
                  active={location === "/support"}
                />
              </ul>
            </div>
          </nav>
        </ScrollArea>
      </aside>
    );
  }
);

Sidebar.displayName = "Sidebar";

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-foreground"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-menu"
        >
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed top-0 left-0 w-3/4 h-full z-50">
            <Sidebar mobile onClose={() => setIsOpen(false)} />
          </div>
          <div
            className="fixed inset-0"
            onClick={() => setIsOpen(false)}
          ></div>
        </div>
      )}
    </>
  );
}
