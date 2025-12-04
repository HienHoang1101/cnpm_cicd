import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { startRegistrationConsumer } from "./consumers/notificationConsumer.js";
import { setupSwagger } from "./swagger/swagger-setup.js";

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

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

global.gConfig = {
  auth_url: process.env.AUTH_SERVICE_URL,
  restaurant_url: process.env.RESTAURANT_SERVICE_URL,
  notification_url: process.env.NOTIFICATION_SERVICE_URL,
  order_url: process.env.ORDER_SERVICE_URL,
};

// Setup Swagger API Documentation
setupSwagger(app);

// Routes
app.use("/api/notifications", notificationRoutes);

// Health check endpoint for Kubernetes
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "notification-service" });
});

// Start Kafka consumer
startRegistrationConsumer();

// Start server
const PORT = process.env.PORT || 5007;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
