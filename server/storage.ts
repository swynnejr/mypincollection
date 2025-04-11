import { 
  User, InsertUser, 
  Pin, InsertPin, 
  UserPin, InsertUserPin, 
  WantListItem, InsertWantListItem, 
  Message, InsertMessage,
  PinPriceHistory, InsertPinPriceHistory
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Pin statistics interface
export interface PinStats {
  haveCount: number;
  wantCount: number;
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Pin methods
  getAllPins(): Promise<Pin[]>;
  getPin(id: number): Promise<Pin | undefined>;
  createPin(pin: InsertPin): Promise<Pin>;
  
  // User Pin Collection methods
  getUserPins(userId: number): Promise<(UserPin & { pin: Pin })[]>;
  addPinToCollection(userPin: InsertUserPin): Promise<UserPin>;
  removePinFromCollection(userId: number, pinId: number): Promise<void>;
  
  // Want List methods
  getUserWantList(userId: number): Promise<(WantListItem & { pin: Pin })[]>;
  addToWantList(wantListItem: InsertWantListItem): Promise<WantListItem>;
  removeFromWantList(userId: number, pinId: number): Promise<void>;
  
  // Message methods
  getUserMessages(userId: number): Promise<(Message & { sender: User })[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Pin Statistics methods
  getPinStats(pinId: number): Promise<PinStats>;
  
  // Price History methods
  getPinPriceHistory(pinId: number): Promise<PinPriceHistory[]>;
  addPinPriceHistory(priceHistory: InsertPinPriceHistory): Promise<PinPriceHistory>;
  
  // Session Store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pins: Map<number, Pin>;
  private userPins: Map<number, UserPin>;
  private wantList: Map<number, WantListItem>;
  private messages: Map<number, Message>;
  private pinPriceHistory: Map<number, PinPriceHistory>;
  
  sessionStore: session.Store;
  currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.pins = new Map();
    this.userPins = new Map();
    this.wantList = new Map();
    this.messages = new Map();
    this.pinPriceHistory = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    this.currentId = {
      users: 1,
      pins: 1,
      userPins: 1,
      wantList: 1,
      messages: 1,
      pinPriceHistory: 1
    };

    // Add some sample pins
    this.seedPins();
  }

  private seedPins() {
    const samplePins: InsertPin[] = [
      {
        name: "Mickey Mouse 50th Anniversary",
        description: "Limited edition collector's pin celebrating Mickey's 50th anniversary",
        collection: "Walt Disney World Collection",
        imageUrl: "https://images.unsplash.com/photo-1559909172-3a1fb7489261",
        category: "Limited Edition",
        releaseDate: "2023-01-15",
        isLimitedEdition: true,
        currentValue: 45.99
      },
      {
        name: "The Mandalorian: Grogu",
        description: "Star Wars collectible pin featuring Grogu (Baby Yoda)",
        collection: "Star Wars Collection",
        imageUrl: "https://images.unsplash.com/photo-1590086783191-a0694c7d1e6e",
        category: "Star Wars",
        releaseDate: "2022-11-12",
        isLimitedEdition: false,
        currentValue: 38.50
      },
      {
        name: "Cinderella Castle",
        description: "Classic Disney pin featuring the iconic Cinderella Castle",
        collection: "Magic Kingdom Collection",
        imageUrl: "https://images.unsplash.com/photo-1610041321420-a596dd6de15a",
        category: "Classic Disney",
        releaseDate: "2022-05-23",
        isLimitedEdition: false,
        currentValue: 32.99
      },
      {
        name: "Spider-Man: Homecoming",
        description: "Marvel collectible pin featuring Spider-Man from Homecoming",
        collection: "Marvel Heroes Collection",
        imageUrl: "https://images.unsplash.com/photo-1620537756604-ae547f21c291",
        category: "Marvel",
        releaseDate: "2021-08-10",
        isLimitedEdition: false,
        currentValue: 29.99
      }
    ];

    // Add pins to the storage
    samplePins.forEach(pin => {
      this.createPin(pin);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async getAllPins(): Promise<Pin[]> {
    return Array.from(this.pins.values());
  }

  async getPin(id: number): Promise<Pin | undefined> {
    return this.pins.get(id);
  }

  async createPin(insertPin: InsertPin): Promise<Pin> {
    const id = this.currentId.pins++;
    const now = new Date();
    const pin: Pin = {
      ...insertPin,
      id,
      createdAt: now
    };
    this.pins.set(id, pin);
    return pin;
  }

  async getUserPins(userId: number): Promise<(UserPin & { pin: Pin })[]> {
    const userPins = Array.from(this.userPins.values())
      .filter(userPin => userPin.userId === userId);
    
    return userPins.map(userPin => {
      const pin = this.pins.get(userPin.pinId);
      if (!pin) throw new Error(`Pin with id ${userPin.pinId} not found`);
      return { ...userPin, pin };
    });
  }

  async addPinToCollection(insertUserPin: InsertUserPin): Promise<UserPin> {
    const id = this.currentId.userPins++;
    const now = new Date();
    const userPin: UserPin = {
      ...insertUserPin,
      id,
      addedAt: now
    };
    this.userPins.set(id, userPin);
    return userPin;
  }

  async removePinFromCollection(userId: number, pinId: number): Promise<void> {
    const userPinEntry = Array.from(this.userPins.entries())
      .find(([_, userPin]) => userPin.userId === userId && userPin.pinId === pinId);
    
    if (userPinEntry) {
      this.userPins.delete(userPinEntry[0]);
    }
  }

  async getUserWantList(userId: number): Promise<(WantListItem & { pin: Pin })[]> {
    const wantListItems = Array.from(this.wantList.values())
      .filter(item => item.userId === userId);
    
    return wantListItems.map(item => {
      const pin = this.pins.get(item.pinId);
      if (!pin) throw new Error(`Pin with id ${item.pinId} not found`);
      return { ...item, pin };
    });
  }

  async addToWantList(insertWantListItem: InsertWantListItem): Promise<WantListItem> {
    const id = this.currentId.wantList++;
    const now = new Date();
    const wantListItem: WantListItem = {
      ...insertWantListItem,
      id,
      addedAt: now
    };
    this.wantList.set(id, wantListItem);
    return wantListItem;
  }

  async removeFromWantList(userId: number, pinId: number): Promise<void> {
    const wantListEntry = Array.from(this.wantList.entries())
      .find(([_, item]) => item.userId === userId && item.pinId === pinId);
    
    if (wantListEntry) {
      this.wantList.delete(wantListEntry[0]);
    }
  }

  async getUserMessages(userId: number): Promise<(Message & { sender: User })[]> {
    const messages = Array.from(this.messages.values())
      .filter(message => message.receiverId === userId || message.senderId === userId)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
    
    return messages.map(message => {
      const sender = this.users.get(message.senderId);
      if (!sender) throw new Error(`User with id ${message.senderId} not found`);
      return { ...message, sender };
    });
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentId.messages++;
    const now = new Date();
    const message: Message = {
      ...insertMessage,
      id,
      isRead: false,
      sentAt: now
    };
    this.messages.set(id, message);
    return message;
  }

  async getPinStats(pinId: number): Promise<PinStats> {
    const haveCount = Array.from(this.userPins.values())
      .filter(userPin => userPin.pinId === pinId).length;
    
    const wantCount = Array.from(this.wantList.values())
      .filter(item => item.pinId === pinId).length;
    
    return { haveCount, wantCount };
  }

  async getPinPriceHistory(pinId: number): Promise<PinPriceHistory[]> {
    // In real implementation, this would fetch from an external API
    // For now, return sample data
    const priceHistory = Array.from(this.pinPriceHistory.values())
      .filter(record => record.pinId === pinId)
      .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());
    
    // If no history exists, generate some sample data
    if (priceHistory.length === 0) {
      const pin = this.pins.get(pinId);
      if (!pin) return [];
      
      const currentPrice = pin.currentValue || 30.0;
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        
        // Fluctuate the price a bit
        const randomFactor = 0.95 + (Math.random() * 0.1);
        const price = currentPrice * randomFactor * (1 + (i / 100));
        
        return this.addPinPriceHistory({
          pinId,
          price,
          source: "eBay"
        });
      });
      
      return Promise.all(last30Days);
    }
    
    return priceHistory;
  }

  async addPinPriceHistory(insertPriceHistory: InsertPinPriceHistory): Promise<PinPriceHistory> {
    const id = this.currentId.pinPriceHistory++;
    const now = new Date();
    const priceHistory: PinPriceHistory = {
      ...insertPriceHistory,
      id,
      recordedAt: now
    };
    this.pinPriceHistory.set(id, priceHistory);
    return priceHistory;
  }
}

// Import the database storage implementation
import { DatabaseStorage } from "./database-storage";

// Use the database storage instead of memory storage
export const storage = new DatabaseStorage();
