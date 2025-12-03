/**
 * Integration Tests for Restaurant Service
 * Tests actual API endpoints with real MongoDB connection
 */

import mongoose from 'mongoose';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

// Test app setup - we'll create a minimal app for testing
const app = express();
app.use(express.json());

// Test configuration
const MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/restaurant_integration_test';
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// Test users
const testOwner = {
  id: new mongoose.Types.ObjectId().toString(),
  email: 'owner@example.com',
  name: 'Restaurant Owner',
  role: 'restaurant'
};

const testCustomer = {
  id: new mongoose.Types.ObjectId().toString(),
  email: 'customer@example.com',
  name: 'Test Customer',
  role: 'customer'
};

const testAdmin = {
  id: new mongoose.Types.ObjectId().toString(),
  email: 'admin@example.com',
  name: 'Test Admin',
  role: 'admin'
};

// Generate tokens
const generateToken = (user) => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
};

const ownerToken = generateToken(testOwner);
const customerToken = generateToken(testCustomer);
const adminToken = generateToken(testAdmin);

// Restaurant Schema for testing
const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: String, required: true },
  description: String,
  cuisineType: [String],
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  phone: String,
  email: String,
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 2.99 },
  minimumOrder: { type: Number, default: 10 },
  estimatedDeliveryTime: { type: Number, default: 30 },
  imageUrls: [String],
  coverImageUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const dishSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  imageUrls: [String],
  isAvailable: { type: Boolean, default: true },
  preparationTime: { type: Number, default: 15 },
  portions: [{
    name: String,
    price: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

let Restaurant;
let Dish;

// Mock auth middleware
const mockAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Setup routes for testing
const setupRoutes = () => {
  // Get all restaurants
  app.get('/api/restaurants', async (req, res) => {
    try {
      const { cuisine, minRating, search, page = 1, limit = 10 } = req.query;
      const query = { isActive: true };
      
      if (cuisine) query.cuisineType = cuisine;
      if (minRating) query.rating = { $gte: parseFloat(minRating) };
      if (search) query.name = { $regex: search, $options: 'i' };
      
      const skip = (page - 1) * limit;
      const restaurants = await Restaurant.find(query).skip(skip).limit(parseInt(limit));
      const total = await Restaurant.countDocuments(query);
      
      res.json({ restaurants, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get restaurant by ID
  app.get('/api/restaurants/:id', async (req, res) => {
    try {
      const restaurant = await Restaurant.findById(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create restaurant (owner only)
  app.post('/api/restaurants', mockAuth, async (req, res) => {
    try {
      if (req.user.role !== 'restaurant' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only restaurant owners can create restaurants' });
      }
      
      const restaurant = new Restaurant({
        ...req.body,
        ownerId: req.user.id
      });
      
      await restaurant.save();
      res.status(201).json(restaurant);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update restaurant
  app.put('/api/restaurants/:id', mockAuth, async (req, res) => {
    try {
      const restaurant = await Restaurant.findById(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }
      
      if (restaurant.ownerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      Object.assign(restaurant, req.body, { updatedAt: new Date() });
      await restaurant.save();
      
      res.json(restaurant);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete restaurant
  app.delete('/api/restaurants/:id', mockAuth, async (req, res) => {
    try {
      const restaurant = await Restaurant.findById(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }
      
      if (restaurant.ownerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      await Restaurant.deleteOne({ _id: req.params.id });
      await Dish.deleteMany({ restaurantId: req.params.id });
      
      res.json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get dishes for restaurant
  app.get('/api/restaurants/:id/dishes', async (req, res) => {
    try {
      const dishes = await Dish.find({ 
        restaurantId: req.params.id,
        isAvailable: true 
      });
      res.json({ dishes });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Add dish to restaurant
  app.post('/api/restaurants/:id/dishes', mockAuth, async (req, res) => {
    try {
      const restaurant = await Restaurant.findById(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }
      
      if (restaurant.ownerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const dish = new Dish({
        ...req.body,
        restaurantId: req.params.id
      });
      
      await dish.save();
      res.status(201).json(dish);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update dish
  app.put('/api/restaurants/:restaurantId/dishes/:dishId', mockAuth, async (req, res) => {
    try {
      const restaurant = await Restaurant.findById(req.params.restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }
      
      if (restaurant.ownerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const dish = await Dish.findByIdAndUpdate(
        req.params.dishId,
        req.body,
        { new: true }
      );
      
      if (!dish) {
        return res.status(404).json({ message: 'Dish not found' });
      }
      
      res.json(dish);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete dish
  app.delete('/api/restaurants/:restaurantId/dishes/:dishId', mockAuth, async (req, res) => {
    try {
      const restaurant = await Restaurant.findById(req.params.restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }
      
      if (restaurant.ownerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      await Dish.deleteOne({ _id: req.params.dishId });
      res.json({ message: 'Dish deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

// Test data
const testRestaurantData = {
  name: 'Test Restaurant',
  description: 'A test restaurant for integration testing',
  cuisineType: ['Italian', 'Pizza'],
  address: {
    street: '123 Test Street',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    coordinates: { lat: 37.7749, lng: -122.4194 }
  },
  phone: '123-456-7890',
  email: 'test@restaurant.com',
  openingHours: {
    monday: { open: '09:00', close: '22:00' },
    tuesday: { open: '09:00', close: '22:00' },
    wednesday: { open: '09:00', close: '22:00' },
    thursday: { open: '09:00', close: '22:00' },
    friday: { open: '09:00', close: '23:00' },
    saturday: { open: '10:00', close: '23:00' },
    sunday: { open: '10:00', close: '21:00' }
  },
  deliveryFee: 2.99,
  minimumOrder: 15,
  estimatedDeliveryTime: 35
};

const testDishData = {
  name: 'Margherita Pizza',
  description: 'Classic pizza with tomato, mozzarella, and basil',
  price: 12.99,
  category: 'Pizza',
  isAvailable: true,
  preparationTime: 20,
  portions: [
    { name: 'Small', price: 9.99 },
    { name: 'Medium', price: 12.99 },
    { name: 'Large', price: 15.99 }
  ]
};

describe('Restaurant Service Integration Tests', () => {
  beforeAll(async () => {
    try {
      await mongoose.connect(MONGO_URI);
      
      // Create models after connection
      Restaurant = mongoose.model('Restaurant', restaurantSchema);
      Dish = mongoose.model('Dish', dishSchema);
      
      setupRoutes();
      console.log('Connected to test database');
    } catch (error) {
      console.error('Failed to connect to test database:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await Restaurant.deleteMany({});
      await Dish.deleteMany({});
      await mongoose.connection.close();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  });

  beforeEach(async () => {
    await Restaurant.deleteMany({});
    await Dish.deleteMany({});
  });

  describe('GET /api/restaurants', () => {
    beforeEach(async () => {
      // Create test restaurants
      await Restaurant.create({
        ...testRestaurantData,
        ownerId: testOwner.id,
        rating: 4.5
      });
      await Restaurant.create({
        ...testRestaurantData,
        name: 'Another Restaurant',
        ownerId: testOwner.id,
        cuisineType: ['Chinese'],
        rating: 3.8
      });
    });

    it('should get all active restaurants', async () => {
      const res = await request(app)
        .get('/api/restaurants')
        .expect(200);

      expect(res.body.restaurants).toBeDefined();
      expect(res.body.restaurants.length).toBe(2);
      expect(res.body.total).toBe(2);
    });

    it('should filter by cuisine type', async () => {
      const res = await request(app)
        .get('/api/restaurants?cuisine=Italian')
        .expect(200);

      expect(res.body.restaurants.length).toBe(1);
      expect(res.body.restaurants[0].cuisineType).toContain('Italian');
    });

    it('should filter by minimum rating', async () => {
      const res = await request(app)
        .get('/api/restaurants?minRating=4')
        .expect(200);

      expect(res.body.restaurants.length).toBe(1);
      expect(res.body.restaurants[0].rating).toBeGreaterThanOrEqual(4);
    });

    it('should search by name', async () => {
      const res = await request(app)
        .get('/api/restaurants?search=Another')
        .expect(200);

      expect(res.body.restaurants.length).toBe(1);
      expect(res.body.restaurants[0].name).toContain('Another');
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/restaurants?page=1&limit=1')
        .expect(200);

      expect(res.body.restaurants.length).toBe(1);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(1);
    });
  });

  describe('GET /api/restaurants/:id', () => {
    let restaurant;

    beforeEach(async () => {
      restaurant = await Restaurant.create({
        ...testRestaurantData,
        ownerId: testOwner.id
      });
    });

    it('should get restaurant by ID', async () => {
      const res = await request(app)
        .get(`/api/restaurants/${restaurant._id}`)
        .expect(200);

      expect(res.body.name).toBe(testRestaurantData.name);
      expect(res.body._id).toBe(restaurant._id.toString());
    });

    it('should return 404 for non-existent restaurant', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/restaurants/${fakeId}`)
        .expect(404);

      expect(res.body.message).toBe('Restaurant not found');
    });
  });

  describe('POST /api/restaurants', () => {
    it('should create restaurant for owner', async () => {
      const res = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(testRestaurantData)
        .expect(201);

      expect(res.body.name).toBe(testRestaurantData.name);
      expect(res.body.ownerId).toBe(testOwner.id);
    });

    it('should reject creation by customer', async () => {
      const res = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(testRestaurantData)
        .expect(403);

      expect(res.body.message).toContain('Only restaurant owners');
    });

    it('should reject creation without token', async () => {
      const res = await request(app)
        .post('/api/restaurants')
        .send(testRestaurantData)
        .expect(401);

      expect(res.body.message).toBe('No token provided');
    });
  });

  describe('PUT /api/restaurants/:id', () => {
    let restaurant;

    beforeEach(async () => {
      restaurant = await Restaurant.create({
        ...testRestaurantData,
        ownerId: testOwner.id
      });
    });

    it('should update restaurant by owner', async () => {
      const res = await request(app)
        .put(`/api/restaurants/${restaurant._id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Updated Restaurant Name' })
        .expect(200);

      expect(res.body.name).toBe('Updated Restaurant Name');
    });

    it('should allow admin to update any restaurant', async () => {
      const res = await request(app)
        .put(`/api/restaurants/${restaurant._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Admin Updated' })
        .expect(200);

      expect(res.body.name).toBe('Admin Updated');
    });

    it('should reject update by non-owner', async () => {
      const res = await request(app)
        .put(`/api/restaurants/${restaurant._id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ name: 'Unauthorized Update' })
        .expect(403);

      expect(res.body.message).toBe('Not authorized');
    });
  });

  describe('DELETE /api/restaurants/:id', () => {
    let restaurant;

    beforeEach(async () => {
      restaurant = await Restaurant.create({
        ...testRestaurantData,
        ownerId: testOwner.id
      });
      
      // Create associated dishes
      await Dish.create({
        ...testDishData,
        restaurantId: restaurant._id
      });
    });

    it('should delete restaurant and associated dishes', async () => {
      const res = await request(app)
        .delete(`/api/restaurants/${restaurant._id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(res.body.message).toBe('Restaurant deleted successfully');

      // Verify deletion
      const deletedRestaurant = await Restaurant.findById(restaurant._id);
      const dishes = await Dish.find({ restaurantId: restaurant._id });
      
      expect(deletedRestaurant).toBeNull();
      expect(dishes.length).toBe(0);
    });

    it('should reject deletion by non-owner', async () => {
      const res = await request(app)
        .delete(`/api/restaurants/${restaurant._id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(res.body.message).toBe('Not authorized');
    });
  });

  describe('Dish Management', () => {
    let restaurant;

    beforeEach(async () => {
      restaurant = await Restaurant.create({
        ...testRestaurantData,
        ownerId: testOwner.id
      });
    });

    describe('GET /api/restaurants/:id/dishes', () => {
      beforeEach(async () => {
        await Dish.create({
          ...testDishData,
          restaurantId: restaurant._id
        });
        await Dish.create({
          ...testDishData,
          name: 'Pepperoni Pizza',
          restaurantId: restaurant._id
        });
      });

      it('should get all dishes for restaurant', async () => {
        const res = await request(app)
          .get(`/api/restaurants/${restaurant._id}/dishes`)
          .expect(200);

        expect(res.body.dishes).toBeDefined();
        expect(res.body.dishes.length).toBe(2);
      });
    });

    describe('POST /api/restaurants/:id/dishes', () => {
      it('should add dish to restaurant', async () => {
        const res = await request(app)
          .post(`/api/restaurants/${restaurant._id}/dishes`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send(testDishData)
          .expect(201);

        expect(res.body.name).toBe(testDishData.name);
        expect(res.body.price).toBe(testDishData.price);
        expect(res.body.restaurantId).toBe(restaurant._id.toString());
      });

      it('should reject adding dish by non-owner', async () => {
        const res = await request(app)
          .post(`/api/restaurants/${restaurant._id}/dishes`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send(testDishData)
          .expect(403);

        expect(res.body.message).toBe('Not authorized');
      });
    });

    describe('PUT /api/restaurants/:restaurantId/dishes/:dishId', () => {
      let dish;

      beforeEach(async () => {
        dish = await Dish.create({
          ...testDishData,
          restaurantId: restaurant._id
        });
      });

      it('should update dish', async () => {
        const res = await request(app)
          .put(`/api/restaurants/${restaurant._id}/dishes/${dish._id}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({ price: 14.99 })
          .expect(200);

        expect(res.body.price).toBe(14.99);
      });
    });

    describe('DELETE /api/restaurants/:restaurantId/dishes/:dishId', () => {
      let dish;

      beforeEach(async () => {
        dish = await Dish.create({
          ...testDishData,
          restaurantId: restaurant._id
        });
      });

      it('should delete dish', async () => {
        const res = await request(app)
          .delete(`/api/restaurants/${restaurant._id}/dishes/${dish._id}`)
          .set('Authorization', `Bearer ${ownerToken}`)
          .expect(200);

        expect(res.body.message).toBe('Dish deleted successfully');

        // Verify deletion
        const deletedDish = await Dish.findById(dish._id);
        expect(deletedDish).toBeNull();
      });
    });
  });
});
