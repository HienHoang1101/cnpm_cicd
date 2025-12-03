/**
 * Custom helper functions for Artillery tests
 */

module.exports = {
  // Generate random email
  generateEmail: function(context, events, done) {
    const randomId = Math.floor(Math.random() * 100000);
    context.vars.randomEmail = `perftest_${randomId}@example.com`;
    return done();
  },

  // Generate random phone
  generatePhone: function(context, events, done) {
    const phone = `+84${Math.floor(Math.random() * 900000000) + 100000000}`;
    context.vars.randomPhone = phone;
    return done();
  },

  // Log response time
  logResponseTime: function(requestParams, response, context, ee, next) {
    console.log(`Response time: ${response.timings.phases.total}ms`);
    return next();
  },

  // Generate order items
  generateOrderItems: function(context, events, done) {
    const items = [
      { itemId: "item1", name: "Pizza Margherita", quantity: 1, price: 12.99 },
      { itemId: "item2", name: "Burger Classic", quantity: 2, price: 8.99 },
      { itemId: "item3", name: "Pasta Carbonara", quantity: 1, price: 10.99 }
    ];
    
    const randomCount = Math.floor(Math.random() * 3) + 1;
    context.vars.orderItems = items.slice(0, randomCount);
    return done();
  },

  // Generate delivery address
  generateAddress: function(context, events, done) {
    const addresses = [
      { street: "123 Main St", city: "Ho Chi Minh", lat: 10.7769, lng: 106.7009 },
      { street: "456 Oak Ave", city: "Hanoi", lat: 21.0285, lng: 105.8542 },
      { street: "789 Pine Rd", city: "Da Nang", lat: 16.0544, lng: 108.2022 }
    ];
    
    context.vars.deliveryAddress = addresses[Math.floor(Math.random() * addresses.length)];
    return done();
  },

  // After response hook - check for errors
  checkResponse: function(requestParams, response, context, ee, next) {
    if (response.statusCode >= 500) {
      ee.emit('error', `Server error: ${response.statusCode}`);
    }
    return next();
  }
};
