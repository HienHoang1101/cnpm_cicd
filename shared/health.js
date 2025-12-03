/**
 * Health Check Middleware
 * Provides health check and metrics endpoints for monitoring
 */

import client from 'prom-client';

// Create a Registry
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'fastfood_'
});

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service']
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  labelNames: ['service']
});

const errorTotal = new client.Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'service']
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);
register.registerMetric(errorTotal);

/**
 * Middleware to track HTTP metrics
 */
export const metricsMiddleware = (serviceName) => {
  return (req, res, next) => {
    const start = Date.now();
    
    // Increment active connections
    activeConnections.labels(serviceName).inc();
    
    // Override end to capture metrics
    const originalEnd = res.end;
    res.end = function(...args) {
      const duration = (Date.now() - start) / 1000;
      const route = req.route?.path || req.path || 'unknown';
      
      // Record metrics
      httpRequestDuration
        .labels(req.method, route, res.statusCode.toString(), serviceName)
        .observe(duration);
      
      httpRequestTotal
        .labels(req.method, route, res.statusCode.toString(), serviceName)
        .inc();
      
      // Decrement active connections
      activeConnections.labels(serviceName).dec();
      
      // Track errors
      if (res.statusCode >= 400) {
        const errorType = res.statusCode >= 500 ? 'server_error' : 'client_error';
        errorTotal.labels(errorType, serviceName).inc();
      }
      
      originalEnd.apply(this, args);
    };
    
    next();
  };
};

/**
 * Health check endpoint handler
 */
export const healthCheck = (serviceName, checkDatabase = null) => {
  return async (req, res) => {
    const health = {
      status: 'healthy',
      service: serviceName,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      checks: {}
    };
    
    // Database check if provided
    if (checkDatabase) {
      try {
        const dbStatus = await checkDatabase();
        health.checks.database = {
          status: dbStatus ? 'connected' : 'disconnected'
        };
      } catch (error) {
        health.checks.database = {
          status: 'error',
          message: error.message
        };
        health.status = 'degraded';
      }
    }
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  };
};

/**
 * Readiness check endpoint handler
 */
export const readinessCheck = (serviceName, checks = []) => {
  return async (req, res) => {
    const result = {
      ready: true,
      service: serviceName,
      timestamp: new Date().toISOString(),
      checks: {}
    };
    
    for (const check of checks) {
      try {
        const checkResult = await check.fn();
        result.checks[check.name] = {
          status: checkResult ? 'ready' : 'not_ready'
        };
        if (!checkResult) {
          result.ready = false;
        }
      } catch (error) {
        result.checks[check.name] = {
          status: 'error',
          message: error.message
        };
        result.ready = false;
      }
    }
    
    const statusCode = result.ready ? 200 : 503;
    res.status(statusCode).json(result);
  };
};

/**
 * Liveness check endpoint handler
 */
export const livenessCheck = (serviceName) => {
  return (req, res) => {
    res.status(200).json({
      alive: true,
      service: serviceName,
      timestamp: new Date().toISOString()
    });
  };
};

/**
 * Metrics endpoint handler
 */
export const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Setup health and metrics routes
 */
export const setupHealthRoutes = (app, serviceName, options = {}) => {
  const { checkDatabase, readinessChecks = [] } = options;
  
  // Apply metrics middleware
  app.use(metricsMiddleware(serviceName));
  
  // Health endpoints
  app.get('/health', healthCheck(serviceName, checkDatabase));
  app.get('/health/live', livenessCheck(serviceName));
  app.get('/health/ready', readinessCheck(serviceName, readinessChecks));
  
  // Metrics endpoint
  app.get('/metrics', metricsEndpoint);
  
  console.log(`✅ Health and metrics endpoints configured for ${serviceName}`);
};

export {
  register,
  httpRequestDuration,
  httpRequestTotal,
  activeConnections,
  errorTotal
};

export default {
  setupHealthRoutes,
  metricsMiddleware,
  healthCheck,
  readinessCheck,
  livenessCheck,
  metricsEndpoint
};
