import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { PinPriceHistory } from "@shared/schema";

interface PriceHistoryChartProps {
  pinId: number;
  pinName: string;
}

export function PriceHistoryChart({ pinId, pinName }: PriceHistoryChartProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch price history
  const { data: priceHistory, isLoading: isLoadingHistory } = useQuery<PinPriceHistory[]>({
    queryKey: [`/api/pins/${pinId}/price-history`],
    queryFn: () => api.pins.getPriceHistory(pinId),
  });

  // Mutation for refreshing eBay price
  const refreshPriceMutation = useMutation({
    mutationFn: () => {
      setIsLoading(true);
      return api.pins.getEbayPrice(pinId);
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/pins/${pinId}/price-history`] });
      queryClient.invalidateQueries({ queryKey: ['/api/pins'] });
      
      toast({
        title: "Price Updated",
        description: `The current value for ${pinName} has been updated with the latest eBay price.`,
        variant: "default",
      });
      setIsLoading(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error Updating Price",
        description: error.message || "Failed to fetch the latest price from eBay.",
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  // Format the data for the chart
  const chartData = priceHistory?.map(item => ({
    date: format(parseISO(item.recordedAt ? item.recordedAt.toString() : new Date().toString()), 'MMM dd'),
    price: item.price
  })) || [];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Price History</CardTitle>
          <CardDescription>Historical price data from eBay</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => refreshPriceMutation.mutate()}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh from eBay
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} dot={false} />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value) => [`$${value}`, 'Price']}
                labelFormatter={(label) => `Date: ${label}`}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <p>No price history data available.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => refreshPriceMutation.mutate()}
              disabled={isLoading}
            >
              Get Price from eBay
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}