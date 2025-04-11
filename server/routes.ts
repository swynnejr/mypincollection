import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertPinSchema, insertUserPinSchema, insertWantListSchema, insertMessageSchema, insertPinPriceHistorySchema } from "@shared/schema";
import { getDisneyPinAveragePrice, getDisneyPinPriceHistory, searchDisneyPins } from "./utils/ebay-api";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Admin routes
  app.post("/api/admin/reseed-database", async (req, res) => {
    // Ensure user is authenticated and is admin (user.id === 1 or username === "devtest")
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    
    // Admin check - user.id === 1 or username === "devtest"
    if (!(req.user!.id === 1 || req.user!.username === "devtest")) {
      return res.status(403).json({ success: false, message: "Not authorized - admin access required" });
    }
    
    try {
      if (storage.reseedDatabase) {
        await storage.reseedDatabase();
        res.json({ success: true, message: "Database reseeded successfully" });
      } else {
        res.status(501).json({ 
          success: false, 
          message: "Reseed functionality not available with current storage implementation" 
        });
      }
    } catch (err) {
      console.error("Error reseeding database:", err);
      res.status(500).json({ 
        success: false, 
        message: "Failed to reseed database",
        error: err instanceof Error ? err.message : String(err)
      });
    }
  });

  // Pin routes
  app.get("/api/pins", async (req, res) => {
    try {
      const pins = await storage.getAllPins();
      res.json(pins);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch pins" });
    }
  });

  app.get("/api/pins/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pin = await storage.getPin(id);
      if (!pin) {
        return res.status(404).json({ message: "Pin not found" });
      }
      res.json(pin);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch pin" });
    }
  });

  app.post("/api/pins", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const validatedData = insertPinSchema.parse(req.body);
      const pin = await storage.createPin(validatedData);
      res.status(201).json(pin);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pin data", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create pin" });
    }
  });

  // User pin collection routes
  app.get("/api/user/pins", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const userPins = await storage.getUserPins(userId);
      res.json(userPins);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch user pins" });
    }
  });

  app.post("/api/user/pins", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const validatedData = insertUserPinSchema.parse({
        ...req.body,
        userId
      });
      const userPin = await storage.addPinToCollection(validatedData);
      res.status(201).json(userPin);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user pin data", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to add pin to collection" });
    }
  });

  app.delete("/api/user/pins/:pinId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const pinId = parseInt(req.params.pinId);
      await storage.removePinFromCollection(userId, pinId);
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to remove pin from collection" });
    }
  });

  // Want list routes
  app.get("/api/user/wantlist", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const wantList = await storage.getUserWantList(userId);
      res.json(wantList);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch want list" });
    }
  });

  app.post("/api/user/wantlist", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const validatedData = insertWantListSchema.parse({
        ...req.body,
        userId
      });
      const wantListItem = await storage.addToWantList(validatedData);
      res.status(201).json(wantListItem);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid want list data", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to add to want list" });
    }
  });

  app.delete("/api/user/wantlist/:pinId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const pinId = parseInt(req.params.pinId);
      await storage.removeFromWantList(userId, pinId);
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to remove from want list" });
    }
  });

  // Messages routes
  app.get("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.user!.id;
      const messages = await storage.getUserMessages(userId);
      res.json(messages);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const senderId = req.user!.id;
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        senderId
      });
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Pin statistics
  app.get("/api/pins/:id/stats", async (req, res) => {
    try {
      const pinId = parseInt(req.params.id);
      const stats = await storage.getPinStats(pinId);
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch pin statistics" });
    }
  });

  // eBay price data routes
  app.get("/api/pins/:id/price-history", async (req, res) => {
    try {
      const pinId = parseInt(req.params.id);
      const pin = await storage.getPin(pinId);
      
      if (!pin) {
        return res.status(404).json({ message: "Pin not found" });
      }
      
      // First try to get the price history from our database
      const savedPriceHistory = await storage.getPinPriceHistory(pinId);
      
      // Return the saved price history
      res.json(savedPriceHistory);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch price history" });
    }
  });
  
  // Endpoint to fetch fresh eBay price data for a pin
  app.get("/api/pins/:id/ebay-price", async (req, res) => {
    try {
      const pinId = parseInt(req.params.id);
      const pin = await storage.getPin(pinId);
      
      if (!pin) {
        return res.status(404).json({ message: "Pin not found" });
      }
      
      // Get the latest price from eBay
      const price = await getDisneyPinAveragePrice(pin.name);
      
      // If we got a valid price, update the pin and store the price history
      if (price > 0) {
        // Update pin's current value
        await storage.updatePinValue(pinId, price);
        
        // Store this price in the price history
        const priceHistoryEntry = {
          pinId,
          price,
          source: 'eBay'
        };
        
        await storage.addPinPriceHistory(priceHistoryEntry);
        
        // Return the updated pin
        const updatedPin = await storage.getPin(pinId);
        res.json(updatedPin);
      } else {
        // If we couldn't get a price, just return the current pin
        res.json(pin);
      }
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch eBay price data" });
    }
  });
  
  // Endpoint to fetch detailed price history from eBay
  app.get("/api/pins/:id/ebay-price-history", async (req, res) => {
    try {
      const pinId = parseInt(req.params.id);
      const pin = await storage.getPin(pinId);
      
      if (!pin) {
        return res.status(404).json({ message: "Pin not found" });
      }
      
      // Get the price history from eBay
      const priceHistory = await getDisneyPinPriceHistory(pin.name);
      
      res.json(priceHistory);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch eBay price history" });
    }
  });

  // Search for Disney pins on eBay
  app.get("/api/ebay/search", async (req, res) => {
    try {
      const searchTerm = req.query.q as string;
      if (!searchTerm) {
        return res.status(400).json({ message: "Search term is required" });
      }
      
      // Search for the pins on eBay
      const searchResults = await searchDisneyPins(searchTerm);
      
      // Return the search results
      res.json(searchResults);
    } catch (err) {
      console.error("Error searching eBay for pins:", err);
      res.status(500).json({ message: "Failed to search eBay for pins" });
    }
  });

  // Import a pin from eBay into our database (admin only)
  app.post("/api/admin/import-pin-from-ebay", async (req, res) => {
    // Ensure user is authenticated and is admin
    if (!req.isAuthenticated() || !(req.user!.id === 1 || req.user!.username === "devtest")) {
      return res.status(403).json({ message: "Not authorized - admin access required" });
    }
    
    try {
      const { name, imageUrl, price, collection, category, description } = req.body;
      
      if (!name || !imageUrl) {
        return res.status(400).json({ message: "Name and imageUrl are required" });
      }
      
      // Create the pin in our database
      const pin = await storage.createPin({
        name,
        imageUrl,
        currentValue: parseFloat(price) || 0,
        collection: collection || "Disney Collection",
        category: category || "Disney Pins",
        description: description || `Authentic Disney Pin: ${name}`,
        isLimitedEdition: false,
        releaseDate: null
      });
      
      // Add initial price history
      if (pin && price) {
        await storage.addPinPriceHistory({
          pinId: pin.id,
          price: parseFloat(price) || 0,
          source: "eBay Import"
        });
      }
      
      res.status(201).json(pin);
    } catch (err) {
      console.error("Error importing pin from eBay:", err);
      res.status(500).json({ message: "Failed to import pin" });
    }
  });

  // Endpoint to cache pins by query
  app.get("/api/ebay/cache-pins", async (req, res) => {
    // Ensure user is authenticated and is admin
    if (!req.isAuthenticated() || !(req.user!.id === 1 || req.user!.username === "devtest")) {
      return res.status(403).json({ message: "Not authorized - admin access required" });
    }
    
    try {
      const searchTerm = req.query.q as string;
      if (!searchTerm) {
        return res.status(400).json({ message: "Search term is required" });
      }
      
      // Search for pins on eBay
      const searchResults = await searchDisneyPins(searchTerm);
      
      // Process and store the pins in our database
      const savedPins = [];
      
      if (searchResults.itemSummaries && searchResults.itemSummaries.length > 0) {
        for (const item of searchResults.itemSummaries) {
          try {
            // Extract details from the eBay item
            const name = item.title;
            const imageUrl = item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl;
            const price = item.price?.value ? parseFloat(item.price.value) : 0;
            
            // Skip items without required data
            if (!name || !imageUrl || !price) continue;
            
            // Determine collection and category from the title or search term
            let collection = "Disney Collection";
            let category = "Disney Pins";
            
            // Try to extract collection from the search term
            if (searchTerm.toLowerCase().includes("star wars")) {
              collection = "Star Wars";
              category = "Star Wars";
            } else if (searchTerm.toLowerCase().includes("princess") || 
                      searchTerm.toLowerCase().includes("ariel") ||
                      searchTerm.toLowerCase().includes("belle") ||
                      searchTerm.toLowerCase().includes("cinderella") ||
                      searchTerm.toLowerCase().includes("jasmine")) {
              collection = "Disney Princesses";
              category = "Princesses";
            } else if (searchTerm.toLowerCase().includes("villain") ||
                      searchTerm.toLowerCase().includes("maleficent") ||
                      searchTerm.toLowerCase().includes("ursula") ||
                      searchTerm.toLowerCase().includes("jafar") ||
                      searchTerm.toLowerCase().includes("evil queen")) {
              collection = "Disney Villains";
              category = "Villains";
            } else if (searchTerm.toLowerCase().includes("mickey") ||
                      searchTerm.toLowerCase().includes("minnie") ||
                      searchTerm.toLowerCase().includes("donald") ||
                      searchTerm.toLowerCase().includes("goofy")) {
              collection = "Mickey and Friends";
              category = "Classic Disney";
            } else if (searchTerm.toLowerCase().includes("haunted") ||
                      searchTerm.toLowerCase().includes("splash") ||
                      searchTerm.toLowerCase().includes("space") ||
                      searchTerm.toLowerCase().includes("pirates")) {
              collection = "Disney Parks";
              category = "Park Attractions";
            }
            
            // Create the pin in our database
            const pin = await storage.createPin({
              name,
              imageUrl,
              currentValue: price,
              collection,
              category,
              description: `Authentic Disney Pin: ${name}`,
              isLimitedEdition: false,
              releaseDate: null
            });
            
            // Add initial price history
            if (pin) {
              await storage.addPinPriceHistory({
                pinId: pin.id,
                price,
                source: "eBay Import"
              });
              
              savedPins.push(pin);
            }
          } catch (itemErr) {
            console.error("Error importing individual pin:", itemErr);
            // Continue with the next item
          }
        }
      }
      
      res.json({
        message: `Successfully cached ${savedPins.length} pins from eBay`,
        pins: savedPins
      });
    } catch (err) {
      console.error("Error caching pins from eBay:", err);
      res.status(500).json({ message: "Failed to cache pins from eBay" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
