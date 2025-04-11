import axios from 'axios';
import { getEbayApiHeaders } from './ebay-auth';

// Base URL for the eBay Marketplace Insights API
const EBAY_SANDBOX_BASE_URL = 'https://api.sandbox.ebay.com';
const EBAY_PRODUCTION_BASE_URL = 'https://api.ebay.com';

// Use sandbox for development, production for actual deployment
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? EBAY_PRODUCTION_BASE_URL 
  : EBAY_SANDBOX_BASE_URL;

export interface EbayItemSummary {
  itemId: string;
  title: string;
  price: {
    value: string;
    currency: string;
  };
  thumbnailImages?: Array<{
    imageUrl: string;
  }>;
  seller?: {
    username: string;
    feedbackPercentage?: string;
    feedbackScore?: number;
  };
  condition?: string;
  conditionId?: string;
  itemWebUrl?: string;
  itemLocation?: {
    country: string;
    postalCode?: string;
  };
  categories?: Array<{
    categoryId: string;
    categoryName: string;
  }>;
  listingStatus?: string;
  bidCount?: number;
  currentBidPrice?: {
    value: string;
    currency: string;
  };
  buyItNowPrice?: {
    value: string;
    currency: string;
  };
  itemEndDate?: string;
  itemCreationDate?: string;
  additionalImages?: string[];
}

export interface EbaySearchResponse {
  total: number;
  itemSummaries: EbayItemSummary[];
}

/**
 * Search for items on eBay using the Marketplace Insights API
 */
export async function searchEbayItems(
  searchTerms: string,
  limit: number = 10,
  filter: Record<string, string> = {}
): Promise<EbaySearchResponse> {
  try {
    // Build the search URL with query parameters
    let url = `${BASE_URL}/buy/marketplace_insights/v1_beta/item_sales/search?`;
    
    // Add search terms
    url += `q=${encodeURIComponent(searchTerms)}`;
    
    // Add limit
    url += `&limit=${limit}`;
    
    // Add any additional filters
    Object.entries(filter).forEach(([key, value]) => {
      url += `&${key}=${encodeURIComponent(value)}`;
    });

    // Make the API request
    const headers = await getEbayApiHeaders();
    const response = await axios.get(url, { headers });
    
    return response.data;
  } catch (error) {
    console.error('Error searching eBay items:', error);
    
    // If we're in development mode, return mock data (for testing)
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using fallback mock data for eBay API in development mode');
      return {
        total: 0,
        itemSummaries: []
      };
    }
    
    throw new Error('Failed to search eBay items');
  }
}

/**
 * Search for Disney pins using the Browse API (more appropriate for images)
 * This API provides better image quality and more details
 */
export async function searchDisneyPins(
  searchTerms: string,
  limit: number = 10
): Promise<any> {
  try {
    // Build the search URL with query parameters
    let url = `${BASE_URL}/buy/browse/v1/item_summary/search?`;
    
    // Add search terms (specifically for Disney pins)
    url += `q=${encodeURIComponent(`Disney pin ${searchTerms}`)}`;
    
    // Add limit
    url += `&limit=${limit}`;
    
    // Add category filter for pins/collectibles
    url += '&category_ids=50310'; // Disney Pins category
    
    // Get highest quality images
    url += '&fieldgroups=EXTENDED';
    
    // Make the API request
    const headers = await getEbayApiHeaders();
    const response = await axios.get(url, { headers });
    
    return response.data;
  } catch (error) {
    console.error('Error searching Disney pins on eBay:', error);
    
    // Return empty data if there's an error
    return {
      total: 0,
      itemSummaries: []
    };
  }
}

/**
 * Get the average price of a Disney pin from eBay
 */
export async function getDisneyPinAveragePrice(pinName: string): Promise<number> {
  try {
    // Search for the pin on eBay with specific filters
    const searchResult = await searchEbayItems(
      `Disney Pin ${pinName}`,
      20,
      {
        category_ids: '50310', // Disney Pins category
        filter: 'soldItems:true', // Only sold items for accurate prices
      }
    );

    if (!searchResult.itemSummaries || searchResult.itemSummaries.length === 0) {
      return 0; // No items found
    }

    // Calculate the average price from the results
    const totalPrice = searchResult.itemSummaries.reduce((sum, item) => {
      const price = parseFloat(item.price.value);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

    return totalPrice / searchResult.itemSummaries.length;
  } catch (error) {
    console.error('Error getting Disney pin average price:', error);
    return 0; // Return 0 if there's an error
  }
}

/**
 * Get the price history data for a Disney pin from eBay
 * This is a simplified version that just returns the last few sold prices
 */
export async function getDisneyPinPriceHistory(pinName: string): Promise<Array<{date: string, price: number}>> {
  try {
    // Search for the pin on eBay with specific filters
    const searchResult = await searchEbayItems(
      `Disney Pin ${pinName}`,
      30,
      {
        category_ids: '50310', // Disney Pins category
        filter: 'soldItems:true', // Only sold items for accurate prices
      }
    );

    if (!searchResult.itemSummaries || searchResult.itemSummaries.length === 0) {
      return []; // No items found
    }

    // Extract the price history from the results
    return searchResult.itemSummaries
      .filter(item => item.itemEndDate) // Only items with an end date
      .map(item => ({
        date: item.itemEndDate!,
        price: parseFloat(item.price.value),
      }))
      .filter(item => !isNaN(item.price)) // Remove any invalid prices
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date
  } catch (error) {
    console.error('Error getting Disney pin price history:', error);
    return []; // Return empty array if there's an error
  }
}