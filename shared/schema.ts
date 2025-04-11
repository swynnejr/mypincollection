import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  avatarUrl: true,
});

// Pin model
export const pins = pgTable("pins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  collection: text("collection"),
  imageUrl: text("image_url"),
  category: text("category"),
  releaseDate: text("release_date"),
  isLimitedEdition: boolean("is_limited_edition").default(false),
  currentValue: doublePrecision("current_value"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPinSchema = createInsertSchema(pins).pick({
  name: true,
  description: true,
  collection: true,
  imageUrl: true,
  category: true,
  releaseDate: true,
  isLimitedEdition: true,
  currentValue: true,
});

// User pin collection (pins a user has)
export const userPins = pgTable("user_pins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  pinId: integer("pin_id").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
  notes: text("notes"),
  forTrade: boolean("for_trade").default(false),
  purchasePrice: doublePrecision("purchase_price"),
  purchaseDate: timestamp("purchase_date"),
});

export const insertUserPinSchema = createInsertSchema(userPins).pick({
  userId: true,
  pinId: true,
  notes: true,
  forTrade: true,
  purchasePrice: true,
  purchaseDate: true,
});

// User want list (pins a user wants)
export const wantList = pgTable("want_list", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  pinId: integer("pin_id").notNull(),
  priority: integer("priority").default(1),
  maxPrice: doublePrecision("max_price"),
  addedAt: timestamp("added_at").defaultNow(),
});

export const insertWantListSchema = createInsertSchema(wantList).pick({
  userId: true,
  pinId: true,
  priority: true,
  maxPrice: true,
});

// Messages between users
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  receiverId: true,
  content: true,
});

// Pin price history from eBay
export const pinPriceHistory = pgTable("pin_price_history", {
  id: serial("id").primaryKey(),
  pinId: integer("pin_id").notNull(),
  price: doublePrecision("price").notNull(),
  source: text("source").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export const insertPinPriceHistorySchema = createInsertSchema(pinPriceHistory).pick({
  pinId: true,
  price: true,
  source: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Pin = typeof pins.$inferSelect;
export type InsertPin = z.infer<typeof insertPinSchema>;

export type UserPin = typeof userPins.$inferSelect;
export type InsertUserPin = z.infer<typeof insertUserPinSchema>;

export type WantListItem = typeof wantList.$inferSelect;
export type InsertWantListItem = z.infer<typeof insertWantListSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type PinPriceHistory = typeof pinPriceHistory.$inferSelect;
export type InsertPinPriceHistory = z.infer<typeof insertPinPriceHistorySchema>;
