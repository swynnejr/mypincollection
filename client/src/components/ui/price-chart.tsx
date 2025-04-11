import { useQuery } from "@tanstack/react-query";
import { PinPriceHistory } from "@shared/schema";

interface PriceChartProps {
  pinId: number;
  height?: number;
}

export function PriceChart({ pinId, height = 80 }: PriceChartProps) {
  const { data: priceHistory, isLoading } = useQuery<PinPriceHistory[]>({
    queryKey: [`/api/pins/${pinId}/price-history`],
  });

  if (isLoading || !priceHistory || priceHistory.length === 0) {
    return (
      <div 
        className="w-full flex items-center justify-center text-muted-foreground"
        style={{ height: `${height}px` }}
      >
        No price data available
      </div>
    );
  }

  // Extract price points and dates for the chart
  const prices = priceHistory.map(entry => entry.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const range = maxPrice - minPrice;

  // Calculate points for the SVG path
  // Scale prices to fit within the SVG viewBox
  const points = priceHistory.map((entry, index) => {
    const x = (index / (priceHistory.length - 1)) * 300;
    const normalizedPrice = range === 0 
      ? 40 
      : 70 - ((entry.price - minPrice) / range) * 60;
    return `${x},${normalizedPrice}`;
  });

  const linePath = `M${points.join(" L")}`;
  const areaPath = `${linePath} L300,80 L0,80 Z`;

  return (
    <svg viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d={linePath} fill="none" strokeWidth="2" stroke="var(--color-primary)" />
      <path d={areaPath} fill="url(#gradient1)" opacity="0.2" />
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
