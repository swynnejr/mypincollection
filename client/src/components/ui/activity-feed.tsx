import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";

interface ActivityItem {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  target?: {
    name: string;
    link?: string;
  };
  comment?: string;
  timestamp: string;
  canLike?: boolean;
  canComment?: boolean;
  canTrade?: boolean;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  title?: string;
  viewAllLink?: string;
}

export function ActivityFeed({ 
  activities, 
  title = "Recent Activity",
  viewAllLink
}: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-5">
        <CardTitle className="text-xl">{title}</CardTitle>
        {viewAllLink && (
          <Link href={viewAllLink}>
            <div className="text-sm text-primary cursor-pointer">View All</div>
          </Link>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id}>
            <div className="flex items-start gap-3 pb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user.name}</span>{" "}
                  {activity.action}{" "}
                  {activity.target && (
                    <>
                      {activity.target.link ? (
                        <Link href={activity.target.link}>
                          <span className="font-medium cursor-pointer text-primary">{activity.target.name}</span>
                        </Link>
                      ) : (
                        <span className="font-medium">{activity.target.name}</span>
                      )}
                    </>
                  )}
                </p>
                
                {activity.comment && (
                  <p className="text-sm mt-1 p-2 rounded-md bg-background">
                    "{activity.comment}"
                  </p>
                )}
                
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{activity.timestamp}</span>
                  <span>•</span>
                  {activity.canLike && (
                    <>
                      <button className="hover:underline">Like</button>
                      <span>•</span>
                    </>
                  )}
                  {activity.canComment && (
                    <>
                      <button className="hover:underline">Comment</button>
                      <span>•</span>
                    </>
                  )}
                  {activity.canTrade && (
                    <button className="hover:underline font-medium text-primary">
                      Offer Trade
                    </button>
                  )}
                </div>
              </div>
            </div>
            <Separator className="my-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
