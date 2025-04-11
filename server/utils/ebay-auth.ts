import axios from 'axios';
import OAuth from 'oauth-1.0a';
import CryptoJS from 'crypto-js';

// eBay API credentials
const EBAY_APP_ID = process.env.EBAY_APP_ID;
const EBAY_CERT_ID = process.env.EBAY_CERT_ID;
const EBAY_DEV_ID = process.env.EBAY_DEV_ID;

// eBay OAuth endpoints - using sandbox initially for testing
const EBAY_SANDBOX_AUTH_URL = 'https://api.sandbox.ebay.com/identity/v1/oauth2/token';
const EBAY_PRODUCTION_AUTH_URL = 'https://api.ebay.com/identity/v1/oauth2/token';

// Use sandbox for development, production for actual deployment
const AUTH_URL = process.env.NODE_ENV === 'production' 
  ? EBAY_PRODUCTION_AUTH_URL 
  : EBAY_SANDBOX_AUTH_URL;

// Token storage - in a real app, this should be in Redis or similar
let tokenCache: {
  accessToken: string;
  expiresAt: number;
} | null = null;

/**
 * Get an OAuth access token from eBay
 */
export async function getEbayAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.accessToken;
  }

  try {
    // Create credentials string for Basic Auth
    const credentials = Buffer.from(`${EBAY_APP_ID}:${EBAY_CERT_ID}`).toString('base64');

    // Request a new token
    const response = await axios({
      method: 'post',
      url: AUTH_URL,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      data: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
    });

    // Cache the token
    const expiresIn = response.data.expires_in * 1000; // convert to ms
    tokenCache = {
      accessToken: response.data.access_token,
      expiresAt: Date.now() + expiresIn - 60000 // Expire 1 minute early to be safe
    };

    return tokenCache.accessToken;
  } catch (error) {
    console.error('Error getting eBay access token:', error);
    throw new Error('Failed to authenticate with eBay API');
  }
}

/**
 * Get headers for eBay API requests including OAuth authorization
 */
export async function getEbayApiHeaders(): Promise<Record<string, string>> {
  const accessToken = await getEbayAccessToken();
  
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',  // Use US marketplace
    'X-EBAY-C-ENDUSERCTX': 'affiliateCampaignId=<ePNCampaignId>,affiliateReferenceId=<referenceId>'
  };
}