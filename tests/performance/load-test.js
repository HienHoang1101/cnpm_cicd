/**
 * Performance/Load Test Script
 * Giả lập người dùng truy cập để kiểm tra khả năng chịu tải của hệ thống
 * 
 * Usage:
 *   node load-test.js                    # Run with default settings
 *   node load-test.js --users=100        # Test with 100 concurrent users
 *   node load-test.js --duration=60      # Run for 60 seconds
 *   node load-test.js --ramp-up          # Gradually increase users
 */

const http = require('http');
const https = require('https');

// Configuration
const config = {
  // Target services to test
  services: [
    { name: 'auth', url: process.env.AUTH_URL || 'http://localhost:5001', endpoints: ['/health', '/api/auth/status'] },
    { name: 'order', url: process.env.ORDER_URL || 'http://localhost:5002', endpoints: ['/health'] },
    { name: 'restaurant', url: process.env.RESTAURANT_URL || 'http://localhost:5003', endpoints: ['/api/restaurants'] },
    { name: 'payment', url: process.env.PAYMENT_URL || 'http://localhost:5005', endpoints: ['/health'] },
    { name: 'notification', url: process.env.NOTIFICATION_URL || 'http://localhost:5006', endpoints: ['/health'] }
  ],
  
  // Test parameters
  concurrentUsers: parseInt(process.env.CONCURRENT_USERS) || 50,
  testDuration: parseInt(process.env.TEST_DURATION) || 30, // seconds
  rampUpTime: parseInt(process.env.RAMP_UP_TIME) || 10, // seconds
  requestDelay: parseInt(process.env.REQUEST_DELAY) || 100, // ms between requests per user
  
  // Metrics endpoint
  metricsUrl: process.env.METRICS_URL || 'http://34.124.159.231:9091'
};

// Parse CLI arguments
process.argv.forEach(arg => {
  if (arg.startsWith('--users=')) config.concurrentUsers = parseInt(arg.split('=')[1]);
  if (arg.startsWith('--duration=')) config.testDuration = parseInt(arg.split('=')[1]);
  if (arg.startsWith('--ramp-up')) config.rampUp = true;
});

// Metrics collection
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  serviceMetrics: {},
  errors: [],
  startTime: null,
  endTime: null
};

// Initialize service metrics
config.services.forEach(s => {
  metrics.serviceMetrics[s.name] = {
    requests: 0,
    success: 0,
    failed: 0,
    responseTimes: [],
    errors: []
  };
});

/**
 * Make HTTP request and measure response time
 */
function makeRequest(service, endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint, service.url);
    const protocol = url.protocol === 'https:' ? https : http;
    const startTime = Date.now();
    
    const req = protocol.get(url.href, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        const success = res.statusCode >= 200 && res.statusCode < 400;
        
        metrics.totalRequests++;
        metrics.responseTimes.push(responseTime);
        metrics.serviceMetrics[service.name].requests++;
        metrics.serviceMetrics[service.name].responseTimes.push(responseTime);
        
        if (success) {
          metrics.successfulRequests++;
          metrics.serviceMetrics[service.name].success++;
        } else {
          metrics.failedRequests++;
          metrics.serviceMetrics[service.name].failed++;
          metrics.serviceMetrics[service.name].errors.push({ 
            status: res.statusCode, 
            endpoint 
          });
        }
        
        resolve({ success, responseTime, status: res.statusCode });
      });
    });
    
    req.on('error', (err) => {
      const responseTime = Date.now() - startTime;
      metrics.totalRequests++;
      metrics.failedRequests++;
      metrics.responseTimes.push(responseTime);
      metrics.serviceMetrics[service.name].requests++;
      metrics.serviceMetrics[service.name].failed++;
      metrics.serviceMetrics[service.name].errors.push({ 
        error: err.message, 
        endpoint 
      });
      
      resolve({ success: false, responseTime, error: err.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      metrics.totalRequests++;
      metrics.failedRequests++;
      metrics.serviceMetrics[service.name].requests++;
      metrics.serviceMetrics[service.name].failed++;
      
      resolve({ success: false, responseTime: 10000, error: 'Timeout' });
    });
  });
}

/**
 * Simulate a single user making requests
 */
async function simulateUser(userId, duration) {
  const endTime = Date.now() + (duration * 1000);
  
  while (Date.now() < endTime) {
    // Randomly select a service and endpoint
    const service = config.services[Math.floor(Math.random() * config.services.length)];
    const endpoint = service.endpoints[Math.floor(Math.random() * service.endpoints.length)];
    
    await makeRequest(service, endpoint);
    
    // Wait before next request
    await new Promise(r => setTimeout(r, config.requestDelay + Math.random() * 100));
  }
}

/**
 * Calculate statistics
 */
function calculateStats(times) {
  if (times.length === 0) return { avg: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0 };
  
  const sorted = [...times].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  
  return {
    avg: Math.round(sum / sorted.length),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)]
  };
}

/**
 * Send metrics to monitoring dashboard
 */
async function sendMetricsToMonitoring(results) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      activeUsers: config.concurrentUsers,
      logins: Math.floor(results.totalRequests * 0.1),
      requests: results.totalRequests,
      responseTime: results.stats.avg
    });
    
    const url = new URL('/api/app-metrics', config.metricsUrl);
    
    const req = http.request(url.href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

/**
 * Print results
 */
function printResults() {
  const duration = (metrics.endTime - metrics.startTime) / 1000;
  const stats = calculateStats(metrics.responseTimes);
  const rps = Math.round(metrics.totalRequests / duration);
  const successRate = ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2);
  
  console.log('\n' + '═'.repeat(60));
  console.log('📊 PERFORMANCE TEST RESULTS');
  console.log('═'.repeat(60));
  
  console.log('\n📈 Overall Statistics:');
  console.log(`   Concurrent Users:    ${config.concurrentUsers}`);
  console.log(`   Test Duration:       ${duration.toFixed(1)}s`);
  console.log(`   Total Requests:      ${metrics.totalRequests}`);
  console.log(`   Requests/Second:     ${rps}`);
  console.log(`   Success Rate:        ${successRate}%`);
  console.log(`   Failed Requests:     ${metrics.failedRequests}`);
  
  console.log('\n⏱️  Response Times:');
  console.log(`   Average:             ${stats.avg}ms`);
  console.log(`   Min:                 ${stats.min}ms`);
  console.log(`   Max:                 ${stats.max}ms`);
  console.log(`   P50 (Median):        ${stats.p50}ms`);
  console.log(`   P95:                 ${stats.p95}ms`);
  console.log(`   P99:                 ${stats.p99}ms`);
  
  console.log('\n🔧 Per-Service Breakdown:');
  Object.entries(metrics.serviceMetrics).forEach(([name, data]) => {
    const svcStats = calculateStats(data.responseTimes);
    const svcSuccessRate = data.requests > 0 
      ? ((data.success / data.requests) * 100).toFixed(1) 
      : '0.0';
    console.log(`   ${name.padEnd(15)} ${data.requests} reqs, ${svcSuccessRate}% success, avg ${svcStats.avg}ms`);
  });
  
  console.log('\n' + '═'.repeat(60));
  
  // Return results for CI/CD
  return {
    concurrentUsers: config.concurrentUsers,
    duration,
    totalRequests: metrics.totalRequests,
    requestsPerSecond: rps,
    successRate: parseFloat(successRate),
    failedRequests: metrics.failedRequests,
    stats,
    serviceMetrics: metrics.serviceMetrics,
    passed: parseFloat(successRate) >= 95 && stats.p95 < 2000
  };
}

/**
 * Main function
 */
async function runLoadTest() {
  console.log('═'.repeat(60));
  console.log('🚀 STARTING PERFORMANCE/LOAD TEST');
  console.log('═'.repeat(60));
  console.log(`   Target Services:     ${config.services.map(s => s.name).join(', ')}`);
  console.log(`   Concurrent Users:    ${config.concurrentUsers}`);
  console.log(`   Test Duration:       ${config.testDuration}s`);
  console.log(`   Request Delay:       ${config.requestDelay}ms`);
  console.log('═'.repeat(60));
  
  metrics.startTime = Date.now();
  
  // Start all virtual users
  const userPromises = [];
  
  if (config.rampUp) {
    // Gradually add users
    console.log('\n📈 Ramping up users...');
    const usersPerSecond = config.concurrentUsers / config.rampUpTime;
    
    for (let i = 0; i < config.concurrentUsers; i++) {
      const delay = (i / usersPerSecond) * 1000;
      userPromises.push(
        new Promise(resolve => setTimeout(resolve, delay))
          .then(() => {
            process.stdout.write(`\r   Active users: ${i + 1}/${config.concurrentUsers}`);
            return simulateUser(i, config.testDuration - (delay / 1000));
          })
      );
    }
    console.log('\n');
  } else {
    // Start all users immediately
    console.log('\n👥 Starting all users simultaneously...\n');
    for (let i = 0; i < config.concurrentUsers; i++) {
      userPromises.push(simulateUser(i, config.testDuration));
    }
  }
  
  // Progress indicator
  const progressInterval = setInterval(() => {
    const elapsed = ((Date.now() - metrics.startTime) / 1000).toFixed(0);
    const progress = Math.min(100, (elapsed / config.testDuration) * 100).toFixed(0);
    process.stdout.write(`\r   Progress: ${progress}% | Requests: ${metrics.totalRequests} | Errors: ${metrics.failedRequests}`);
  }, 500);
  
  // Wait for all users to complete
  await Promise.all(userPromises);
  
  clearInterval(progressInterval);
  metrics.endTime = Date.now();
  
  // Print results
  const results = printResults();
  
  // Send to monitoring
  console.log('\n📡 Sending metrics to monitoring dashboard...');
  const sent = await sendMetricsToMonitoring(results);
  console.log(sent ? '   ✅ Metrics sent successfully' : '   ⚠️ Could not send metrics');
  
  // Exit with appropriate code for CI/CD
  if (results.passed) {
    console.log('\n✅ PERFORMANCE TEST PASSED\n');
    process.exit(0);
  } else {
    console.log('\n❌ PERFORMANCE TEST FAILED');
    console.log('   - Success rate below 95% OR P95 response time above 2000ms\n');
    process.exit(1);
  }
}

// Run the test
runLoadTest().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
