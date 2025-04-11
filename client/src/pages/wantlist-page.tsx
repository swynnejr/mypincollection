import { useQuery, useMutation } from "@tanstack/react-query";
import { Pin, WantListItem } from "@shared/schema";
import { PinCard } from "@/components/ui/pin-card";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { AuthTooltip } from "@/components/ui/auth-tooltip";
import { useAuthStatus } from "@/lib/protected-route";
import { Button } from "@/components/ui/button";
import { HeartOff, Loader2 } from "lucide-react";

export default function WantListPage() {
  const { toast } = useToast();
  const isAuthenticated = useAuthStatus();
  
  // Fetch the user's want list
  const { data: wantList, isLoading: isLoadingWantList } = useQuery<(WantListItem & { pin: Pin })[]>({
    queryKey: ['/api/user/wantlist'],
    enabled: isAuthenticated,
  });
  
  // Mutation to remove a pin from the want list
  const removeFromWantListMutation = useMutation({
    mutationFn: async (pinId: number) => {
      const res = await fetch(`/api/user/wantlist/${pinId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove pin from want list');
      return pinId;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Pin removed from your want list!",
      });
      // Invalidate the want list query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/user/wantlist'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRemoveFromWantList = (pinId: number) => {
    removeFromWantListMutation.mutate(pinId);
  };

  // UI Elements based on loading and authentication states
  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="p-8 text-center">
          <div className="mb-4">
            <HeartOff className="mx-auto h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Want List</h2>
          <p className="text-muted-foreground mb-6">
            Create an account to keep track of pins you want to add to your collection.
          </p>
          <AuthTooltip>
            <Button>View Want List</Button>
          </AuthTooltip>
        </div>
      );
    }

    if (isLoadingWantList) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!wantList || wantList.length === 0) {
      return (
        <div className="p-8 text-center">
          <div className="mb-4">
            <HeartOff className="mx-auto h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your Want List is Empty</h2>
          <p className="text-muted-foreground mb-6">
            You haven't added any pins to your want list yet. Browse pins and click the heart icon to add them.
          </p>
          <Button asChild>
            <a href="/">Browse Pins</a>
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {wantList.map((item) => (
          <PinCard
            key={item.id}
            pin={item.pin}
            inWantList={true}
            onToggleWantList={() => handleRemoveFromWantList(item.pinId)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Want List</h1>
        <p className="text-muted-foreground">
          Keep track of all the pins you're looking to add to your collection.
        </p>
      </div>
      {renderContent()}
    </div>
  );
}