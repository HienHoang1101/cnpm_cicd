import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import paymentRoutes from "./routes/paymentRoutes.js";
import { setupSwagger } from "./swagger/swagger-setup.js";

dotenv.config();

// Initialize Express
const app = express();

// Security: Configure CORS properly
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Important: Only apply json parsing to non-webhook routes
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payment/webhook") {
    next(); // Skip body parsing for webhook route
  } else {
    express.json()(req, res, next); // Apply JSON parsing to other routes
  }
});

global.gConfig = {
  auth_url: process.env.AUTH_SERVICE_URL,
  restaurant_url: process.env.RESTAURANT_SERVICE_URL,
  notification_url: process.env.NOTIFICATION_SERVICE_URL,
  order_url: process.env.ORDER_SERVICE_URL,
};

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Setup Swagger API Documentation
setupSwagger(app);

// Routes
app.use("/api/payment", paymentRoutes);

// Health check endpoint for Kubernetes
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "payment-service" });
});

// Start Server
const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});
