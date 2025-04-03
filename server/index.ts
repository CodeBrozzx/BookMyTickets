import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initDb } from "./db";
import { PgStorage } from "./pgStorage";
import { storage } from "./storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize the database connection
  // Set up global unhandled rejection handler to prevent crashes
  process.on('unhandledRejection', (reason, promise) => {
    log(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    // Don't crash the application, just log the error
  });
  
  // Make sure we have a storage mechanism regardless of database connection
  let activeStorage = storage; // Default to memory storage
  
  try {
    // Try to connect to the database
    const dbConnected = await initDb();
    
    if (dbConnected) {
      try {
        log("Using PostgreSQL database for storage");
        const pgStorage = new PgStorage();
        // Switch to the PostgreSQL storage
        Object.assign(storage, pgStorage);
        // Initialize the database with sample data
        await pgStorage.initializeData();
      } catch (pgError) {
        log(`Error setting up PostgreSQL storage: ${pgError}`);
        log("Falling back to in-memory storage");
        // Ensure in-memory storage is initialized
        await storage.initializeData();
      }
    } else {
      log("Database connection failed, using in-memory storage");
      // Ensure in-memory storage is initialized
      await storage.initializeData();
    }
  } catch (error) {
    log(`Error in storage setup: ${error}`);
    log("Ensuring in-memory storage is initialized");
    // Make absolutely sure we have functioning storage
    await storage.initializeData().catch(initError => {
      log(`Critical error: Failed to initialize memory storage: ${initError}`);
    });
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error('Express error handler:', err);
    res.status(status).json({ message });
    // Don't rethrow the error, as it will crash the server
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
