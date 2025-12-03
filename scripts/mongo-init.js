// MongoDB Initialization Script
// Creates databases and users for all microservices

print('========================================');
print('🚀 Initializing FastFood Delivery Databases');
print('========================================');

// Switch to admin database
db = db.getSiblingDB('admin');

// Create databases for each service
const databases = [
  'fastfood_auth',
  'fastfood_order', 
  'fastfood_restaurant',
  'fastfood_payment',
  'fastfood_notification',
  'fastfood_admin',
  'fastfood_delivery'
];

databases.forEach(dbName => {
  print(`📦 Creating database: ${dbName}`);
  db = db.getSiblingDB(dbName);
  
  // Create a dummy collection to ensure DB is created
  db.createCollection('_init');
  db._init.insertOne({ 
    initialized: true, 
    createdAt: new Date(),
    service: dbName.replace('fastfood_', '')
  });
  
  print(`✅ Database ${dbName} created successfully`);
});

// Create indexes for better performance
print('');
print('📊 Creating indexes...');

// Auth service indexes
db = db.getSiblingDB('fastfood_auth');
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phone: 1 });
db.users.createIndex({ role: 1 });
print('✅ Auth indexes created');

// Order service indexes
db = db.getSiblingDB('fastfood_order');
db.createCollection('orders');
db.orders.createIndex({ userId: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });
db.orders.createIndex({ restaurantId: 1 });
db.createCollection('cartitems');
db.cartitems.createIndex({ userId: 1 });
print('✅ Order indexes created');

// Restaurant service indexes
db = db.getSiblingDB('fastfood_restaurant');
db.createCollection('restaurants');
db.restaurants.createIndex({ name: 'text', description: 'text' });
db.restaurants.createIndex({ isActive: 1 });
db.restaurants.createIndex({ ownerId: 1 });
db.createCollection('dishes');
db.dishes.createIndex({ restaurantId: 1 });
db.dishes.createIndex({ name: 'text' });
db.dishes.createIndex({ isAvailable: 1 });
print('✅ Restaurant indexes created');

// Payment service indexes
db = db.getSiblingDB('fastfood_payment');
db.createCollection('payments');
db.payments.createIndex({ orderId: 1 });
db.payments.createIndex({ userId: 1 });
db.payments.createIndex({ status: 1 });
db.payments.createIndex({ createdAt: -1 });
print('✅ Payment indexes created');

// Notification service indexes
db = db.getSiblingDB('fastfood_notification');
db.createCollection('notifications');
db.notifications.createIndex({ userId: 1 });
db.notifications.createIndex({ isRead: 1 });
db.notifications.createIndex({ createdAt: -1 });
print('✅ Notification indexes created');

// Delivery service indexes
db = db.getSiblingDB('fastfood_delivery');
db.createCollection('deliveries');
db.deliveries.createIndex({ orderId: 1 });
db.deliveries.createIndex({ driverId: 1 });
db.deliveries.createIndex({ status: 1 });
db.createCollection('livedrivers');
db.livedrivers.createIndex({ isOnline: 1 });
db.livedrivers.createIndex({ location: '2dsphere' });
print('✅ Delivery indexes created');

print('');
print('========================================');
print('✅ All databases initialized successfully!');
print('========================================');
