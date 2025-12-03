// Prometheus Metrics Middleware for Express.js Services
// =====================================================
// This middleware provides automatic metrics collection for monitoring

import promClient from 'prom-client';

// Create a Registry to hold all metrics
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({
  register,
  prefix: 'fastfood_',
  labels: { service: process.env.SERVICE_NAME || 'unknown' }
});

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 1, 2, 5]
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service']
});

const httpRequestsInProgress = new promClient.Gauge({
  name: 'http_requests_in_progress',
  help: 'Number of HTTP requests currently in progress',
  labelNames: ['method', 'service']
});

const httpRequestSize = new promClient.Summary({
  name: 'http_request_size_bytes',
  help: 'Size of HTTP requests in bytes',
  labelNames: ['method', 'route', 'service']
});

const httpResponseSize = new promClient.Summary({
  name: 'http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'route', 'service']
});

// Database metrics
const dbQueryDuration = new promClient.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'collection', 'service'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]
});

const dbConnectionsActive = new promClient.Gauge({
  name: 'db_connections_active',
  help: 'Number of active database connections',
  labelNames: ['service']
});

// Business metrics
const ordersCreated = new promClient.Counter({
  name: 'orders_created_total',
  help: 'Total number of orders created',
  labelNames: ['type', 'restaurant', 'service']
});

const ordersCompleted = new promClient.Counter({
  name: 'orders_completed_total',
  help: 'Total number of orders completed',
  labelNames: ['type', 'restaurant', 'service']
});

const ordersCancelled = new promClient.Counter({
  name: 'orders_cancelled_total',
  help: 'Total number of orders cancelled',
  labelNames: ['reason', 'service']
});

const orderValue = new promClient.Histogram({
  name: 'order_value_dollars',
  help: 'Distribution of order values',
  labelNames: ['type', 'service'],
  buckets: [5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200]
});

const paymentProcessed = new promClient.Counter({
  name: 'payments_processed_total',
  help: 'Total number of payments processed',
  labelNames: ['method', 'status', 'service']
});

const paymentValue = new promClient.Histogram({
  name: 'payment_value_dollars',
  help: 'Distribution of payment values',
  labelNames: ['method', 'service'],
  buckets: [5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200]
});

// Auth metrics
const authAttempts = new promClient.Counter({
  name: 'auth_attempts_total',
  help: 'Total number of authentication attempts',
  labelNames: ['type', 'status', 'service']
});

const activeUsers = new promClient.Gauge({
  name: 'active_users_current',
  help: 'Current number of active users',
  labelNames: ['role', 'service']
});

// Test metrics
const testRuns = new promClient.Counter({
  name: 'test_runs_total',
  help: 'Total number of test runs',
  labelNames: ['suite', 'service']
});

const testPassed = new promClient.Counter({
  name: 'test_passed_total',
  help: 'Total number of passed tests',
  labelNames: ['suite', 'service']
});

const testFailures = new promClient.Counter({
  name: 'test_failures_total',
  help: 'Total number of failed tests',
  labelNames: ['suite', 'service']
});

const testSkipped = new promClient.Counter({
  name: 'test_skipped_total',
  help: 'Total number of skipped tests',
  labelNames: ['suite', 'service']
});

const testDuration = new promClient.Histogram({
  name: 'test_duration_seconds',
  help: 'Duration of test execution in seconds',
  labelNames: ['suite', 'test_name', 'service'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120, 300]
});

const codeCoverage = new promClient.Gauge({
  name: 'code_coverage_percent',
  help: 'Code coverage percentage',
  labelNames: ['type', 'service']
});

// Register all custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(httpRequestsInProgress);
register.registerMetric(httpRequestSize);
register.registerMetric(httpResponseSize);
register.registerMetric(dbQueryDuration);
register.registerMetric(dbConnectionsActive);
register.registerMetric(ordersCreated);
register.registerMetric(ordersCompleted);
register.registerMetric(ordersCancelled);
register.registerMetric(orderValue);
register.registerMetric(paymentProcessed);
register.registerMetric(paymentValue);
register.registerMetric(authAttempts);
register.registerMetric(activeUsers);
register.registerMetric(testRuns);
register.registerMetric(testPassed);
register.registerMetric(testFailures);
register.registerMetric(testSkipped);
register.registerMetric(testDuration);
register.registerMetric(codeCoverage);

// Middleware to track HTTP requests
const metricsMiddleware = (serviceName) => {
  return (req, res, next) => {
    const start = process.hrtime.bigint();
    const labels = {
      method: req.method,
      service: serviceName
    };

    // Track request in progress
    httpRequestsInProgress.inc({ method: req.method, service: serviceName });

    // Track request size
    const requestSize = parseInt(req.headers['content-length']) || 0;
    httpRequestSize.observe(
      { method: req.method, route: req.route?.path || req.path, service: serviceName },
      requestSize
    );

    // Override res.end to capture response metrics
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      res.end = originalEnd;
      res.end(chunk, encoding);

      // Calculate duration
      const end = process.hrtime.bigint();
      const durationSeconds = Number(end - start) / 1e9;

      // Get route (normalize to avoid high cardinality)
      const route = req.route?.path || req.path || 'unknown';
      const normalizedRoute = route.replace(/\/[0-9a-fA-F-]{24,}/g, '/:id');

      const responseLabels = {
        method: req.method,
        route: normalizedRoute,
        status_code: res.statusCode,
        service: serviceName
      };

      // Record metrics
      httpRequestDuration.observe(responseLabels, durationSeconds);
      httpRequestTotal.inc(responseLabels);
      httpRequestsInProgress.dec({ method: req.method, service: serviceName });

      // Track response size
      const responseSize = parseInt(res.getHeader('content-length')) || 0;
      httpResponseSize.observe(
        { method: req.method, route: normalizedRoute, service: serviceName },
        responseSize
      );
    };

    next();
  };
};

// Metrics endpoint handler
const metricsEndpoint = async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

// Health check endpoint
const healthEndpoint = (serviceName) => {
  return async (req, res) => {
    const health = {
      status: 'healthy',
      service: serviceName,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    };

    res.status(200).json(health);
  };
};

// Ready check endpoint (for Kubernetes)
const readyEndpoint = (dependencies = []) => {
  return async (req, res) => {
    const checks = await Promise.all(
      dependencies.map(async (dep) => {
        try {
          const result = await dep.check();
          return { name: dep.name, status: 'ready', ...result };
        } catch (error) {
          return { name: dep.name, status: 'not_ready', error: error.message };
        }
      })
    );

    const allReady = checks.every(c => c.status === 'ready');
    
    res.status(allReady ? 200 : 503).json({
      status: allReady ? 'ready' : 'not_ready',
      checks
    });
  };
};

// Helper functions for business metrics
const recordOrder = (type, restaurant, value) => {
  ordersCreated.inc({ type, restaurant, service: process.env.SERVICE_NAME });
  orderValue.observe({ type, service: process.env.SERVICE_NAME }, value);
};

const recordOrderCompleted = (type, restaurant) => {
  ordersCompleted.inc({ type, restaurant, service: process.env.SERVICE_NAME });
};

const recordOrderCancelled = (reason) => {
  ordersCancelled.inc({ reason, service: process.env.SERVICE_NAME });
};

const recordPayment = (method, status, value) => {
  paymentProcessed.inc({ method, status, service: process.env.SERVICE_NAME });
  if (status === 'success') {
    paymentValue.observe({ method, service: process.env.SERVICE_NAME }, value);
  }
};

const recordAuthAttempt = (type, status) => {
  authAttempts.inc({ type, status, service: process.env.SERVICE_NAME });
};

const recordTestResult = (suite, testName, status, duration) => {
  testRuns.inc({ suite, service: process.env.SERVICE_NAME });
  
  if (status === 'passed') {
    testPassed.inc({ suite, service: process.env.SERVICE_NAME });
  } else if (status === 'failed') {
    testFailures.inc({ suite, service: process.env.SERVICE_NAME });
  } else if (status === 'skipped') {
    testSkipped.inc({ suite, service: process.env.SERVICE_NAME });
  }
  
  testDuration.observe(
    { suite, test_name: testName, service: process.env.SERVICE_NAME },
    duration
  );
};

const recordCodeCoverage = (type, percentage) => {
  codeCoverage.set({ type, service: process.env.SERVICE_NAME }, percentage);
};

const recordDbQuery = (operation, collection, durationSeconds) => {
  dbQueryDuration.observe(
    { operation, collection, service: process.env.SERVICE_NAME },
    durationSeconds
  );
};

export {
  register,
  metricsMiddleware,
  metricsEndpoint,
  healthEndpoint,
  readyEndpoint,
  recordOrder,
  recordOrderCompleted,
  recordOrderCancelled,
  recordPayment,
  recordAuthAttempt,
  recordTestResult,
  recordCodeCoverage,
  recordDbQuery,
  httpRequestDuration,
  httpRequestTotal,
  dbQueryDuration,
  ordersCreated,
  paymentProcessed,
  authAttempts,
  testRuns,
  testPassed,
  testFailures,
  codeCoverage
};

export default {
  register,
  metricsMiddleware,
  metricsEndpoint,
  healthEndpoint,
  readyEndpoint
};
