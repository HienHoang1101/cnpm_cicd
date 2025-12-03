// Structured Logger for FastFood Delivery Services
// =================================================
// This logger outputs JSON logs that can be collected by Loki

import winston from 'winston';

const { combine, timestamp, json, errors, colorize, printf } = winston.format;

// Custom format for development
const devFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Create logger configuration based on environment
const createLogger = (serviceName) => {
  const isProduction = process.env.NODE_ENV === 'production';

  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    defaultMeta: {
      service: serviceName,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    },
    format: combine(
      errors({ stack: true }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      json()
    ),
    transports: [
      // Console transport
      new winston.transports.Console({
        format: isProduction
          ? combine(timestamp(), json())
          : combine(colorize(), timestamp(), devFormat)
      })
    ],
    // Don't exit on uncaught exceptions
    exitOnError: false
  });

  // Add file transport in production
  if (isProduction) {
    logger.add(new winston.transports.File({
      filename: `/var/log/${serviceName}/error.log`,
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }));

    logger.add(new winston.transports.File({
      filename: `/var/log/${serviceName}/combined.log`,
      maxsize: 5242880,
      maxFiles: 5
    }));
  }

  return logger;
};

// Request logging middleware
const requestLogger = (logger) => {
  return (req, res, next) => {
    const start = Date.now();
    const requestId = req.headers['x-request-id'] || generateRequestId();

    // Add request ID to request object
    req.requestId = requestId;

    // Log incoming request
    logger.info('Incoming request', {
      requestId,
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      res.end = originalEnd;
      res.end(chunk, encoding);

      const duration = Date.now() - start;

      const logData = {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        contentLength: res.getHeader('content-length'),
        userId: req.user?.id
      };

      if (res.statusCode >= 500) {
        logger.error('Request completed with server error', logData);
      } else if (res.statusCode >= 400) {
        logger.warn('Request completed with client error', logData);
      } else {
        logger.info('Request completed', logData);
      }
    };

    next();
  };
};

// Error logging middleware
const errorLogger = (logger) => {
  return (err, req, res, next) => {
    logger.error('Unhandled error', {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack,
      method: req.method,
      url: req.url,
      userId: req.user?.id
    });
    next(err);
  };
};

// Utility function to generate request ID
function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Log levels helper
const LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  HTTP: 'http',
  DEBUG: 'debug'
};

// Specialized logging functions
class ServiceLogger {
  constructor(serviceName) {
    this.logger = createLogger(serviceName);
    this.serviceName = serviceName;
  }

  // Auth events
  authSuccess(userId, method) {
    this.logger.info('Authentication successful', {
      event: 'auth_success',
      userId,
      method
    });
  }

  authFailure(email, reason) {
    this.logger.warn('Authentication failed', {
      event: 'auth_failure',
      email,
      reason
    });
  }

  // Order events
  orderCreated(orderId, customerId, amount) {
    this.logger.info('Order created', {
      event: 'order_created',
      orderId,
      customerId,
      amount
    });
  }

  orderStatusChanged(orderId, oldStatus, newStatus, updatedBy) {
    this.logger.info('Order status changed', {
      event: 'order_status_changed',
      orderId,
      oldStatus,
      newStatus,
      updatedBy
    });
  }

  orderCompleted(orderId, customerId, amount, duration) {
    this.logger.info('Order completed', {
      event: 'order_completed',
      orderId,
      customerId,
      amount,
      duration
    });
  }

  orderCancelled(orderId, reason, cancelledBy) {
    this.logger.warn('Order cancelled', {
      event: 'order_cancelled',
      orderId,
      reason,
      cancelledBy
    });
  }

  // Payment events
  paymentInitiated(orderId, amount, method) {
    this.logger.info('Payment initiated', {
      event: 'payment_initiated',
      orderId,
      amount,
      method
    });
  }

  paymentSuccess(orderId, transactionId, amount) {
    this.logger.info('Payment successful', {
      event: 'payment_success',
      orderId,
      transactionId,
      amount
    });
  }

  paymentFailure(orderId, reason, amount) {
    this.logger.error('Payment failed', {
      event: 'payment_failure',
      orderId,
      reason,
      amount
    });
  }

  // Test events
  testStarted(suite, testCount) {
    this.logger.info('Test suite started', {
      event: 'test_started',
      suite,
      testCount
    });
  }

  testPassed(suite, testName, duration) {
    this.logger.info('Test passed', {
      event: 'test_passed',
      suite,
      testName,
      duration,
      status: 'PASS'
    });
  }

  testFailed(suite, testName, duration, error) {
    this.logger.error('Test failed', {
      event: 'test_failed',
      suite,
      testName,
      duration,
      status: 'FAIL',
      error
    });
  }

  testSkipped(suite, testName, reason) {
    this.logger.warn('Test skipped', {
      event: 'test_skipped',
      suite,
      testName,
      status: 'SKIP',
      reason
    });
  }

  testSuiteCompleted(suite, passed, failed, skipped, duration) {
    this.logger.info('Test suite completed', {
      event: 'test_suite_completed',
      suite,
      passed,
      failed,
      skipped,
      total: passed + failed + skipped,
      duration,
      passRate: ((passed / (passed + failed + skipped)) * 100).toFixed(2) + '%'
    });
  }

  // Database events
  dbConnected() {
    this.logger.info('Database connected', {
      event: 'db_connected'
    });
  }

  dbDisconnected(reason) {
    this.logger.warn('Database disconnected', {
      event: 'db_disconnected',
      reason
    });
  }

  dbQuerySlow(query, duration) {
    this.logger.warn('Slow database query detected', {
      event: 'db_slow_query',
      query,
      duration
    });
  }

  // Service events
  serviceStarted(port) {
    this.logger.info('Service started', {
      event: 'service_started',
      port
    });
  }

  serviceStopped(reason) {
    this.logger.info('Service stopped', {
      event: 'service_stopped',
      reason
    });
  }

  // Generic logging methods
  info(message, metadata = {}) {
    this.logger.info(message, metadata);
  }

  warn(message, metadata = {}) {
    this.logger.warn(message, metadata);
  }

  error(message, metadata = {}) {
    this.logger.error(message, metadata);
  }

  debug(message, metadata = {}) {
    this.logger.debug(message, metadata);
  }
}

export {
  createLogger,
  requestLogger,
  errorLogger,
  ServiceLogger,
  LogLevel,
  generateRequestId
};

export default ServiceLogger;
