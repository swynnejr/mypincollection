import { 
  User, InsertUser, 
  Pin, InsertPin,
  UserPin, InsertUserPin,
  WantListItem, InsertWantListItem,
  Message, InsertMessage,
  PinPriceHistory, InsertPinPriceHistory,
  users, pins, userPins, wantList, messages, pinPriceHistory
} from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { IStorage, PinStats } from "./storage";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
    
    // Seed data if needed
    this.seedInitialData();
  }

  private async seedInitialData() {
    // Check if pins exist, if not, seed them
    const existingPins = await db.select().from(pins).limit(1);
    if (existingPins.length === 0) {
      // Seed default pins
      const defaultPins = [
        {
          name: "Mickey Mouse 50th Anniversary",
          description: "Commemorative pin for Mickey Mouse's 50th Anniversary celebration.",
          collection: "Disney Celebrations",
          imageUrl: "https://i.imgur.com/RRUe0Mo.png",
          category: "Characters",
          releaseDate: "2021-10-01",
          isLimitedEdition: true,
          currentValue: 45.99,
        },
        {
          name: "Haunted Mansion",
          description: "The iconic Haunted Mansion attraction featuring the Hitchhiking Ghosts.",
          collection: "Disney Parks",
          imageUrl: "https://i.imgur.com/DKLMxG0.png",
          category: "Attractions",
          releaseDate: "2020-09-01",
          isLimitedEdition: false,
          currentValue: 35.50,
        },
        {
          name: "Star Wars: The Mandalorian",
          description: "Pin featuring The Mandalorian and Grogu (Baby Yoda)",
          collection: "Star Wars",
          imageUrl: "https://i.imgur.com/JU6c4gi.png",
          category: "Movies",
          releaseDate: "2019-12-15",
          isLimitedEdition: true,
          currentValue: 32.75,
        },
        {
          name: "Stitch with Dole Whip",
          description: "Stitch enjoying a classic Dole Whip at Disney Parks",
          collection: "Disney Food",
          imageUrl: "https://i.imgur.com/Kl43BWV.png",
          category: "Characters",
          releaseDate: "2022-06-01",
          isLimitedEdition: false,
          currentValue: 28.99,
        }
      ];

      // Insert pins
      for (const pinData of defaultPins) {
        const [pin] = await db.insert(pins).values({
          ...pinData,
          createdAt: new Date()
        }).returning();

        // Add some price history for each pin (last 30 days)
        const now = new Date();
        const priceInserts = [];
        
        for (let i = 1; i <= 30; i++) {
          const date = new Date();
          date.setDate(now.getDate() - (30 - i));
          
          // Generate a slightly random price with an overall upward trend
          const basePrice = pinData.currentValue * 0.8;  // Start at 80% of current value
          const trend = (i / 30) * pinData.currentValue * 0.3;  // Increases over time to 30% growth
          const random = (Math.random() - 0.5) * 5;  // Random fluctuation
          
          priceInserts.push({
            pinId: pin.id,
            price: basePrice + trend + random,
            recordedAt: date,
            source: "eBay"
          });
        }
        
        // Batch insert price history
        if (priceInserts.length > 0) {
          await db.insert(pinPriceHistory).values(priceInserts);
        }
      }
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllPins(): Promise<Pin[]> {
    return await db.select().from(pins);
  }

  async getPin(id: number): Promise<Pin | undefined> {
    const [pin] = await db.select().from(pins).where(eq(pins.id, id));
    return pin;
  }

  async createPin(insertPin: InsertPin): Promise<Pin> {
    const [pin] = await db.insert(pins).values(insertPin).returning();
    return pin;
  }

  async getUserPins(userId: number): Promise<(UserPin & { pin: Pin })[]> {
    const userPinsWithJoin = await db
      .select({
        userPin: userPins,
        pin: pins
      })
      .from(userPins)
      .innerJoin(pins, eq(userPins.pinId, pins.id))
      .where(eq(userPins.userId, userId));

    return userPinsWithJoin.map(row => ({
      ...row.userPin,
      pin: row.pin
    }));
  }

  async addPinToCollection(insertUserPin: InsertUserPin): Promise<UserPin> {
    const [userPin] = await db
      .insert(userPins)
      .values({
        ...insertUserPin,
        addedAt: new Date(),
      })
      .returning();
    
    return userPin;
  }

  async removePinFromCollection(userId: number, pinId: number): Promise<void> {
    await db
      .delete(userPins)
      .where(
        and(
          eq(userPins.userId, userId),
          eq(userPins.pinId, pinId)
        )
      );
  }

  async getUserWantList(userId: number): Promise<(WantListItem & { pin: Pin })[]> {
    const wantItemsWithJoin = await db
      .select({
        wantItem: wantList,
        pin: pins
      })
      .from(wantList)
      .innerJoin(pins, eq(wantList.pinId, pins.id))
      .where(eq(wantList.userId, userId));

    return wantItemsWithJoin.map(row => ({
      ...row.wantItem,
      pin: row.pin
    }));
  }

  async addToWantList(insertWantListItem: InsertWantListItem): Promise<WantListItem> {
    const [wantListItem] = await db
      .insert(wantList)
      .values({
        ...insertWantListItem,
        addedAt: new Date(),
      })
      .returning();
    
    return wantListItem;
  }

  async removeFromWantList(userId: number, pinId: number): Promise<void> {
    await db
      .delete(wantList)
      .where(
        and(
          eq(wantList.userId, userId),
          eq(wantList.pinId, pinId)
        )
      );
  }

  async getUserMessages(userId: number): Promise<(Message & { sender: User })[]> {
    const messagesWithSender = await db
      .select({
        message: messages,
        sender: users,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.receiverId, userId))
      .orderBy(desc(messages.sentAt));

    return messagesWithSender.map(row => ({
      ...row.message,
      sender: row.sender
    }));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({
        ...insertMessage,
        sentAt: new Date(),
        isRead: false,
      })
      .returning();
    
    return message;
  }

  async getPinStats(pinId: number): Promise<PinStats> {
    // Count pins in collections
    const userPinsResult = await db
      .select()
      .from(userPins)
      .where(eq(userPins.pinId, pinId));
    
    // Count pins in want lists
    const wantListResult = await db
      .select()
      .from(wantList)
      .where(eq(wantList.pinId, pinId));
    
    const haveCount = userPinsResult.length;
    const wantCount = wantListResult.length;
    
    return { haveCount, wantCount };
  }

  async getPinPriceHistory(pinId: number): Promise<PinPriceHistory[]> {
    return await db
      .select()
      .from(pinPriceHistory)
      .where(eq(pinPriceHistory.pinId, pinId))
      .orderBy(pinPriceHistory.recordedAt);
  }

  async addPinPriceHistory(insertPriceHistory: InsertPinPriceHistory): Promise<PinPriceHistory> {
    const [priceHistory] = await db
      .insert(pinPriceHistory)
      .values({
        ...insertPriceHistory,
        recordedAt: new Date(),
      })
      .returning();
    
    return priceHistory;
  }
}