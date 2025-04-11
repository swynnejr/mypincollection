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

  async reseedDatabase() {
    // Clear existing data first
    await db.delete(pinPriceHistory);
    await db.delete(wantList);
    await db.delete(userPins);
    await db.delete(pins);
    
    // Then run the seed function
    return this.seedInitialData();
  }
  
  private async seedInitialData() {
    // Check if pins exist, if not, seed them
    const existingPins = await db.select().from(pins).limit(1);
    if (existingPins.length === 0) {
      // Seed default pins
      const defaultPins = [
        // Aladdin 30th Anniversary Series from Pin and Pop
        {
          name: "Aladdin 30th Anniversary - Jasmine & Rajah",
          description: "Beautiful pin showing Princess Jasmine with her loyal tiger companion Rajah. Part of the Aladdin 30th Anniversary series.",
          collection: "Aladdin 30th Anniversary",
          imageUrl: "https://pinandpop.com/cdn/shop/products/image_ba3a1d35-aba5-4c85-a13d-c4af9b31b4c9_1500x.jpg",
          category: "Characters",
          releaseDate: "2022-11-25",
          isLimitedEdition: true,
          currentValue: 43.99,
        },
        {
          name: "Aladdin 30th Anniversary - Genie Magic Lamp",
          description: "Stunning pin featuring the Genie emerging from his magic lamp, with detailed gold accents. Part of the Aladdin 30th Anniversary series.",
          collection: "Aladdin 30th Anniversary",
          imageUrl: "https://pinandpop.com/cdn/shop/products/image_b5af4ef1-e9ef-4ebc-8bfe-53b35ad0ee21_1500x.jpg",
          category: "Characters",
          releaseDate: "2022-11-25",
          isLimitedEdition: true,
          currentValue: 45.50,
        },
        {
          name: "Aladdin 30th Anniversary - Jafar",
          description: "Detailed pin depicting the villainous Jafar with his cobra staff. Part of the Aladdin 30th Anniversary series.",
          collection: "Aladdin 30th Anniversary",
          imageUrl: "https://pinandpop.com/cdn/shop/products/image_97bd3c12-63bb-4d91-872c-0b1a23841dba_1500x.jpg",
          category: "Villains",
          releaseDate: "2022-11-25",
          isLimitedEdition: true,
          currentValue: 47.99,
        },
        {
          name: "Aladdin 30th Anniversary - Abu",
          description: "Cute pin featuring Aladdin's mischievous monkey companion Abu holding a jewel. Part of the Aladdin 30th Anniversary series.",
          collection: "Aladdin 30th Anniversary",
          imageUrl: "https://pinandpop.com/cdn/shop/products/image_cf2b77e9-ecce-4f96-8a51-8a4a9f12ab9f_1500x.jpg",
          category: "Characters",
          releaseDate: "2022-11-25",
          isLimitedEdition: true,
          currentValue: 38.99,
        },
        {
          name: "Aladdin 30th Anniversary - Magic Carpet Ride",
          description: "Romantic pin showing Aladdin and Jasmine on their magic carpet ride during 'A Whole New World'. Part of the Aladdin 30th Anniversary series.",
          collection: "Aladdin 30th Anniversary",
          imageUrl: "https://pinandpop.com/cdn/shop/products/image_88c14d4b-0d01-4878-b23e-9c7a066a6f6a_1500x.jpg",
          category: "Scenes",
          releaseDate: "2022-11-25",
          isLimitedEdition: true,
          currentValue: 52.99,
        },
        {
          name: "Aladdin 30th Anniversary - Iago",
          description: "Colorful pin featuring Jafar's parrot sidekick Iago. Part of the Aladdin 30th Anniversary series.",
          collection: "Aladdin 30th Anniversary",
          imageUrl: "https://pinandpop.com/cdn/shop/products/image_26ae0d1d-98ea-469d-a7d8-2172bb4a16ac_1500x.jpg",
          category: "Characters",
          releaseDate: "2022-11-25",
          isLimitedEdition: true,
          currentValue: 39.50,
        },
        {
          name: "Mickey Mouse 50th Anniversary",
          description: "Commemorative pin celebrating Mickey Mouse's 50th Anniversary with gold detailing and iconic pose.",
          collection: "Disney Celebrations",
          imageUrl: "https://cdn-ssl.s7.disneystore.com/is/image/DisneyShopping/6505057372939",
          category: "Characters",
          releaseDate: "2021-10-01",
          isLimitedEdition: true,
          currentValue: 45.99,
        },
        {
          name: "Haunted Mansion: Hitchhiking Ghosts",
          description: "Detailed pin showcasing the iconic Hitchhiking Ghosts from the Haunted Mansion attraction.",
          collection: "Disney Parks",
          imageUrl: "https://cdn-ssl.s7.disneystore.com/is/image/DisneyShopping/400020820926",
          category: "Attractions",
          releaseDate: "2020-09-01",
          isLimitedEdition: false,
          currentValue: 35.50,
        },
        {
          name: "Star Wars: The Mandalorian and Grogu",
          description: "Limited edition pin featuring The Mandalorian holding Grogu (Baby Yoda) in his iconic hovering pram.",
          collection: "Star Wars",
          imageUrl: "https://cdn-ssl.s7.disneystore.com/is/image/DisneyShopping/6505057372911",
          category: "Movies",
          releaseDate: "2019-12-15",
          isLimitedEdition: true,
          currentValue: 32.75,
        },
        {
          name: "Stitch with Dole Whip",
          description: "Adorable pin of Stitch enjoying a classic Dole Whip treat at Disney Parks.",
          collection: "Disney Food",
          imageUrl: "https://cdn-ssl.s7.disneystore.com/is/image/DisneyShopping/400929419889",
          category: "Characters",
          releaseDate: "2022-06-01",
          isLimitedEdition: false,
          currentValue: 28.99,
        },
        {
          name: "Disney Castle 100th Anniversary",
          description: "Commemorative pin featuring the iconic Cinderella Castle with special 100th anniversary Disney detailing and sparkle effects.",
          collection: "Anniversary Collection",
          imageUrl: "https://cdn-ssl.s7.disneystore.com/is/image/DisneyShopping/400022345146",
          category: "Landmarks",
          releaseDate: "2023-01-01",
          isLimitedEdition: true,
          currentValue: 49.99,
        },
        {
          name: "Minnie Mouse: Vintage Style",
          description: "Retro-styled Minnie Mouse pin featuring classic animation art from the early Disney era.",
          collection: "Disney Classics",
          imageUrl: "https://cdn-ssl.s7.disneystore.com/is/image/DisneyShopping/400021045697",
          category: "Characters",
          releaseDate: "2022-05-15",
          isLimitedEdition: false,
          currentValue: 29.99,
        },
        {
          name: "WALL-E and EVE",
          description: "Adorable pin showing WALL-E and EVE together in outer space with stars in the background.",
          collection: "Pixar Collection",
          imageUrl: "https://cdn-ssl.s7.disneystore.com/is/image/DisneyShopping/400929695953",
          category: "Pixar",
          releaseDate: "2021-08-10",
          isLimitedEdition: false,
          currentValue: 27.99,
        },
        {
          name: "Marvel: Avengers Logo",
          description: "Official Avengers logo pin with metallic detailing and gemstone accents.",
          collection: "Marvel Heroes",
          imageUrl: "https://cdn-ssl.s7.disneystore.com/is/image/DisneyShopping/6505057373840",
          category: "Marvel",
          releaseDate: "2022-11-25",
          isLimitedEdition: false,
          currentValue: 32.50,
        },
        {
          name: "Jungle Cruise: Skipper Mickey",
          description: "Mickey Mouse dressed as a Jungle Cruise skipper with the iconic boat in the background.",
          collection: "Disney Parks",
          imageUrl: "https://cdn-ssl.s7.disneystore.com/is/image/DisneyShopping/400020820859",
          category: "Attractions",
          releaseDate: "2022-07-30",
          isLimitedEdition: true,
          currentValue: 38.99,
        },
        {
          name: "Tinker Bell: Pixie Dust Trail",
          description: "Tinker Bell flying and leaving a trail of sparkling pixie dust behind her.",
          collection: "Disney Fairies",
          imageUrl: "https://cdn-ssl.s7.disneystore.com/is/image/DisneyShopping/6505057373734",
          category: "Characters",
          releaseDate: "2023-02-14",
          isLimitedEdition: false,
          currentValue: 26.99,
        },
        {
          name: "Goofy: Through the Years",
          description: "Special pin showcasing Goofy's evolution through multiple decades of Disney animation.",
          collection: "Evolution Series",
          imageUrl: "https://cdn-ssl.s7.disneystore.com/is/image/DisneyShopping/400021045673",
          category: "Characters",
          releaseDate: "2023-03-09",
          isLimitedEdition: true,
          currentValue: 42.50,
        },
        {
          name: "Disney Monorail",
          description: "Detailed pin of the iconic Disney Parks monorail system with moving parts.",
          collection: "Disney Transportation",
          imageUrl: "https://cdn-ssl.s7.disneystore.com/is/image/DisneyShopping/400020820873",
          category: "Transportation",
          releaseDate: "2022-08-12",
          isLimitedEdition: false,
          currentValue: 33.75,
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
    // If username is empty, don't try to look it up
    if (!username || username.trim() === '') {
      return undefined;
    }
    
    const [user] = await db.select().from(users).where(eq(users.username, username.trim()));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    console.log("Creating user with data:", insertUser);
    
    // Make sure optional fields are properly set to null if empty or undefined
    const userData = {
      ...insertUser,
      displayName: insertUser.displayName || null,
      email: insertUser.email || null,
      avatarUrl: insertUser.avatarUrl || null
    };
    
    console.log("Processed user data for database:", userData);
    
    try {
      const [user] = await db.insert(users).values(userData).returning();
      console.log("Successfully created user:", user);
      return user;
    } catch (error) {
      console.error("Database error creating user:", error);
      throw error;
    }
  }

  async getAllPins(): Promise<Pin[]> {
    return await db.select().from(pins);
  }

  async getPin(id: number): Promise<Pin | undefined> {
    const [pin] = await db.select().from(pins).where(eq(pins.id, id));
    return pin;
  }
  
  async updatePinValue(pinId: number, currentValue: number): Promise<Pin> {
    const [pin] = await db
      .update(pins)
      .set({ currentValue })
      .where(eq(pins.id, pinId))
      .returning();
      
    if (!pin) {
      throw new Error(`Pin with id ${pinId} not found`);
    }
    
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