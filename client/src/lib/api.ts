import { apiRequest } from "./queryClient";
import { 
  Pin, 
  InsertPin, 
  UserPin, 
  InsertUserPin, 
  WantListItem, 
  InsertWantListItem,
  Message,
  InsertMessage,
  PinPriceHistory
} from "@shared/schema";

export const api = {
  // User APIs
  auth: {
    login: async (username: string, password: string) => {
      const res = await apiRequest("POST", "/api/login", { username, password });
      return await res.json();
    },
    register: async (userData: { username: string, password: string, displayName?: string, email?: string }) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    logout: async () => {
      return await apiRequest("POST", "/api/logout");
    },
    getCurrentUser: async () => {
      const res = await apiRequest("GET", "/api/user");
      return await res.json();
    }
  },
  
  // Pin APIs
  pins: {
    getAll: async (): Promise<Pin[]> => {
      const res = await apiRequest("GET", "/api/pins");
      return await res.json();
    },
    getOne: async (id: number): Promise<Pin> => {
      const res = await apiRequest("GET", `/api/pins/${id}`);
      return await res.json();
    },
    create: async (pinData: InsertPin): Promise<Pin> => {
      const res = await apiRequest("POST", "/api/pins", pinData);
      return await res.json();
    },
    getStats: async (id: number): Promise<{ haveCount: number, wantCount: number }> => {
      const res = await apiRequest("GET", `/api/pins/${id}/stats`);
      return await res.json();
    },
    getPriceHistory: async (id: number): Promise<PinPriceHistory[]> => {
      const res = await apiRequest("GET", `/api/pins/${id}/price-history`);
      return await res.json();
    },
    getEbayPrice: async (id: number): Promise<Pin> => {
      const res = await apiRequest("GET", `/api/pins/${id}/ebay-price`);
      return await res.json();
    },
    getEbayPriceHistory: async (id: number): Promise<Array<{date: string, price: number}>> => {
      const res = await apiRequest("GET", `/api/pins/${id}/ebay-price-history`);
      return await res.json();
    }
  },
  
  // User Pin Collection APIs
  collection: {
    getUserPins: async (): Promise<(UserPin & { pin: Pin })[]> => {
      const res = await apiRequest("GET", "/api/user/pins");
      return await res.json();
    },
    addPin: async (data: { pinId: number, notes?: string, purchasePrice?: number, purchaseDate?: string }): Promise<UserPin> => {
      const res = await apiRequest("POST", "/api/user/pins", data);
      return await res.json();
    },
    removePin: async (pinId: number): Promise<void> => {
      await apiRequest("DELETE", `/api/user/pins/${pinId}`);
    },
    updatePin: async (userPinId: number, data: Partial<InsertUserPin>): Promise<UserPin> => {
      const res = await apiRequest("PATCH", `/api/user/pins/${userPinId}`, data);
      return await res.json();
    }
  },
  
  // Want List APIs
  wantList: {
    getWantList: async (): Promise<(WantListItem & { pin: Pin })[]> => {
      const res = await apiRequest("GET", "/api/user/wantlist");
      return await res.json();
    },
    addToWantList: async (data: { pinId: number, priority?: number, maxPrice?: number }): Promise<WantListItem> => {
      const res = await apiRequest("POST", "/api/user/wantlist", data);
      return await res.json();
    },
    removeFromWantList: async (pinId: number): Promise<void> => {
      await apiRequest("DELETE", `/api/user/wantlist/${pinId}`);
    },
    updateWantListItem: async (wantListId: number, data: Partial<InsertWantListItem>): Promise<WantListItem> => {
      const res = await apiRequest("PATCH", `/api/user/wantlist/${wantListId}`, data);
      return await res.json();
    }
  },
  
  // Message APIs
  messages: {
    getUserMessages: async (): Promise<(Message & { sender: any })[]> => {
      const res = await apiRequest("GET", "/api/messages");
      return await res.json();
    },
    sendMessage: async (data: { receiverId: number, content: string }): Promise<Message> => {
      const res = await apiRequest("POST", "/api/messages", data);
      return await res.json();
    },
    markAsRead: async (messageId: number): Promise<Message> => {
      const res = await apiRequest("PATCH", `/api/messages/${messageId}/read`);
      return await res.json();
    }
  }
};
