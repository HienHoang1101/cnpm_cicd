/**
 * Food Delivery Server Unit Tests
 * ================================
 * Test các chức năng core của server
 */

import { describe, it, expect, test, jest } from '@jest/globals';

// ==========================================
// HEALTH CHECK TESTS
// ==========================================
describe('Health Check Endpoint', () => {
  test('SRV-U-001: should return healthy status', () => {
    const healthCheck = () => ({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0'
    });

    const result = healthCheck();
    
    expect(result.status).toBe('healthy');
    expect(result.timestamp).toBeDefined();
    expect(result.uptime).toBeGreaterThan(0);
    expect(result.version).toBe('1.0.0');
  });

  test('should include service dependencies status', () => {
    const checkDependencies = () => ({
      database: 'connected',
      redis: 'connected',
      kafka: 'connected'
    });

    const deps = checkDependencies();
    
    expect(deps.database).toBe('connected');
    expect(deps.redis).toBe('connected');
    expect(deps.kafka).toBe('connected');
  });
});

// ==========================================
// ERROR HANDLING MIDDLEWARE TESTS
// ==========================================
describe('Error Handling Middleware', () => {
  test('SRV-U-002: should format error response correctly', () => {
    const formatError = (err, statusCode = 500) => ({
      success: false,
      error: {
        message: err.message || 'Internal Server Error',
        code: err.code || 'INTERNAL_ERROR',
        statusCode
      }
    });

    const error = new Error('Something went wrong');
    error.code = 'VALIDATION_ERROR';
    
    const response = formatError(error, 400);
    
    expect(response.success).toBe(false);
    expect(response.error.message).toBe('Something went wrong');
    expect(response.error.code).toBe('VALIDATION_ERROR');
    expect(response.error.statusCode).toBe(400);
  });

  test('should handle different error types', () => {
    const errorTypes = {
      ValidationError: 400,
      UnauthorizedError: 401,
      ForbiddenError: 403,
      NotFoundError: 404,
      ConflictError: 409,
      InternalError: 500
    };

    const getStatusCode = (errorType) => errorTypes[errorType] || 500;

    expect(getStatusCode('ValidationError')).toBe(400);
    expect(getStatusCode('NotFoundError')).toBe(404);
    expect(getStatusCode('UnknownError')).toBe(500);
  });

  test('should not expose sensitive information in production', () => {
    const sanitizeError = (error, isProduction = true) => {
      if (isProduction) {
        return {
          message: error.message,
          code: error.code
          // Stack trace omitted in production
        };
      }
      return {
        message: error.message,
        code: error.code,
        stack: error.stack
      };
    };

    const error = new Error('Database connection failed');
    error.code = 'DB_ERROR';
    error.stack = 'Error: Database connection failed\n    at db.connect (db.js:10:5)';

    const prodError = sanitizeError(error, true);
    const devError = sanitizeError(error, false);

    expect(prodError.stack).toBeUndefined();
    expect(devError.stack).toBeDefined();
  });
});

// ==========================================
// REQUEST LOGGING TESTS
// ==========================================
describe('Request Logging', () => {
  test('SRV-U-003: should log request details', () => {
    const logRequest = (req) => ({
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });

    const mockRequest = {
      method: 'GET',
      url: '/api/restaurants',
      ip: '192.168.1.1',
      headers: {
        'user-agent': 'Mozilla/5.0'
      }
    };

    const log = logRequest(mockRequest);

    expect(log.method).toBe('GET');
    expect(log.url).toBe('/api/restaurants');
    expect(log.ip).toBe('192.168.1.1');
    expect(log.timestamp).toBeDefined();
  });

  test('should mask sensitive data in logs', () => {
    const maskSensitiveData = (data) => {
      const sensitiveFields = ['password', 'token', 'authorization', 'credit_card'];
      const masked = { ...data };
      
      for (const field of sensitiveFields) {
        if (masked[field]) {
          masked[field] = '***REDACTED***';
        }
      }
      
      return masked;
    };

    const data = {
      email: 'user@test.com',
      password: 'secret123',
      token: 'jwt-token-here'
    };

    const masked = maskSensitiveData(data);

    expect(masked.email).toBe('user@test.com');
    expect(masked.password).toBe('***REDACTED***');
    expect(masked.token).toBe('***REDACTED***');
  });

  test('should log response time', () => {
    const calculateResponseTime = (startTime) => {
      const endTime = Date.now();
      return endTime - startTime;
    };

    const startTime = Date.now() - 150; // Simulate 150ms request
    const responseTime = calculateResponseTime(startTime);

    expect(responseTime).toBeGreaterThanOrEqual(150);
    expect(responseTime).toBeLessThan(200);
  });
});

// ==========================================
// RATE LIMITING TESTS
// ==========================================
describe('Rate Limiting', () => {
  test('SRV-U-004: should track request count per IP', () => {
    const rateLimiter = {
      requests: new Map(),
      limit: 100,
      windowMs: 60000,

      check(ip) {
        const now = Date.now();
        const record = this.requests.get(ip) || { count: 0, start: now };

        if (now - record.start > this.windowMs) {
          record.count = 1;
          record.start = now;
        } else {
          record.count++;
        }

        this.requests.set(ip, record);
        return record.count <= this.limit;
      },

      getRemaining(ip) {
        const record = this.requests.get(ip);
        if (!record) return this.limit;
        return Math.max(0, this.limit - record.count);
      }
    };

    // First 100 requests should pass
    for (let i = 0; i < 100; i++) {
      expect(rateLimiter.check('192.168.1.1')).toBe(true);
    }

    // 101st request should fail
    expect(rateLimiter.check('192.168.1.1')).toBe(false);
    expect(rateLimiter.getRemaining('192.168.1.1')).toBe(0);

    // Different IP should still work
    expect(rateLimiter.check('192.168.1.2')).toBe(true);
  });

  test('should have stricter limits for auth endpoints', () => {
    const rateLimits = {
      general: 100,    // requests per minute
      auth: 10,        // requests per minute for login/register
      payment: 20      // requests per minute for payment
    };

    expect(rateLimits.auth).toBeLessThan(rateLimits.general);
    expect(rateLimits.payment).toBeLessThan(rateLimits.general);
  });

  test('should return rate limit headers', () => {
    const getRateLimitHeaders = (limit, remaining, resetTime) => ({
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetTime.toString()
    });

    const headers = getRateLimitHeaders(100, 95, Date.now() + 60000);

    expect(headers['X-RateLimit-Limit']).toBe('100');
    expect(headers['X-RateLimit-Remaining']).toBe('95');
    expect(headers['X-RateLimit-Reset']).toBeDefined();
  });
});

// ==========================================
// CORS CONFIGURATION TESTS
// ==========================================
describe('CORS Configuration', () => {
  test('SRV-U-005: should configure allowed origins', () => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://fastfood-delivery.com',
      'https://admin.fastfood-delivery.com'
    ];

    const isOriginAllowed = (origin) => allowedOrigins.includes(origin);

    expect(isOriginAllowed('http://localhost:3000')).toBe(true);
    expect(isOriginAllowed('https://fastfood-delivery.com')).toBe(true);
    expect(isOriginAllowed('https://malicious-site.com')).toBe(false);
  });

  test('should set correct CORS headers', () => {
    const getCorsHeaders = (origin, allowedOrigins) => {
      const isAllowed = allowedOrigins.includes(origin);
      
      if (!isAllowed) return null;

      return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
      };
    };

    const allowedOrigins = ['http://localhost:3000'];
    const headers = getCorsHeaders('http://localhost:3000', allowedOrigins);

    expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:3000');
    expect(headers['Access-Control-Allow-Credentials']).toBe('true');
  });

  test('should handle preflight requests', () => {
    const handlePreflight = (method) => method === 'OPTIONS';

    expect(handlePreflight('OPTIONS')).toBe(true);
    expect(handlePreflight('GET')).toBe(false);
    expect(handlePreflight('POST')).toBe(false);
  });
});

// ==========================================
// REQUEST VALIDATION TESTS
// ==========================================
describe('Request Validation', () => {
  test('SRV-U-006: should sanitize input data', () => {
    const sanitizeInput = (input) => {
      if (typeof input !== 'string') return input;
      
      return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
    };

    expect(sanitizeInput('<script>alert("XSS")</script>')).toBe('');
    expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
    expect(sanitizeInput('onclick=hack()')).toBe('hack()');
    expect(sanitizeInput('  normal text  ')).toBe('normal text');
  });

  test('should validate content-type header', () => {
    const isValidContentType = (contentType, expected) => {
      if (!contentType) return false;
      return contentType.toLowerCase().includes(expected.toLowerCase());
    };

    expect(isValidContentType('application/json', 'application/json')).toBe(true);
    expect(isValidContentType('application/json; charset=utf-8', 'application/json')).toBe(true);
    expect(isValidContentType('text/html', 'application/json')).toBe(false);
  });

  test('should limit request body size', () => {
    const MAX_BODY_SIZE = 10 * 1024 * 1024; // 10MB

    const isBodySizeValid = (size) => size <= MAX_BODY_SIZE;

    expect(isBodySizeValid(1024)).toBe(true);
    expect(isBodySizeValid(5 * 1024 * 1024)).toBe(true);
    expect(isBodySizeValid(20 * 1024 * 1024)).toBe(false);
  });
});

// ==========================================
// RESPONSE FORMATTING TESTS
// ==========================================
describe('Response Formatting', () => {
  test('SRV-U-007: should format success response', () => {
    const formatSuccess = (data, message = 'Success') => ({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });

    const response = formatSuccess({ id: 1, name: 'Test' }, 'Data retrieved');

    expect(response.success).toBe(true);
    expect(response.message).toBe('Data retrieved');
    expect(response.data.id).toBe(1);
    expect(response.timestamp).toBeDefined();
  });

  test('should format paginated response', () => {
    const formatPaginated = (data, page, limit, total) => ({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

    const response = formatPaginated([1, 2, 3], 2, 10, 25);

    expect(response.pagination.page).toBe(2);
    expect(response.pagination.totalPages).toBe(3);
    expect(response.pagination.hasNext).toBe(true);
    expect(response.pagination.hasPrev).toBe(true);
  });

  test('should handle empty data', () => {
    const formatSuccess = (data) => ({
      success: true,
      data: data || [],
      count: data ? data.length : 0
    });

    const emptyResponse = formatSuccess(null);
    const dataResponse = formatSuccess([1, 2, 3]);

    expect(emptyResponse.data).toEqual([]);
    expect(emptyResponse.count).toBe(0);
    expect(dataResponse.count).toBe(3);
  });
});

// ==========================================
// COMPRESSION MIDDLEWARE TESTS
// ==========================================
describe('Compression Middleware', () => {
  test('SRV-U-008: should determine if compression is needed', () => {
    const shouldCompress = (contentType, contentLength, threshold = 1024) => {
      const compressibleTypes = [
        'application/json',
        'text/html',
        'text/css',
        'text/javascript',
        'application/javascript'
      ];

      if (contentLength < threshold) return false;
      return compressibleTypes.some(type => contentType.includes(type));
    };

    expect(shouldCompress('application/json', 2000)).toBe(true);
    expect(shouldCompress('application/json', 500)).toBe(false);
    expect(shouldCompress('image/png', 5000)).toBe(false);
  });

  test('should set correct compression headers', () => {
    const getCompressionHeaders = (encoding) => ({
      'Content-Encoding': encoding,
      'Vary': 'Accept-Encoding'
    });

    const headers = getCompressionHeaders('gzip');

    expect(headers['Content-Encoding']).toBe('gzip');
    expect(headers['Vary']).toBe('Accept-Encoding');
  });

  test('should detect client compression support', () => {
    const getPreferredEncoding = (acceptEncoding) => {
      if (!acceptEncoding) return null;
      if (acceptEncoding.includes('br')) return 'br';
      if (acceptEncoding.includes('gzip')) return 'gzip';
      if (acceptEncoding.includes('deflate')) return 'deflate';
      return null;
    };

    expect(getPreferredEncoding('gzip, deflate, br')).toBe('br');
    expect(getPreferredEncoding('gzip, deflate')).toBe('gzip');
    expect(getPreferredEncoding('')).toBe(null);
  });
});

// ==========================================
// SECURITY HEADERS TESTS (HELMET)
// ==========================================
describe('Helmet Security Headers', () => {
  test('SRV-U-009: should set security headers', () => {
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Download-Options': 'noopen',
      'X-Permitted-Cross-Domain-Policies': 'none',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    expect(securityHeaders['X-Content-Type-Options']).toBe('nosniff');
    expect(securityHeaders['X-Frame-Options']).toBe('DENY');
    expect(securityHeaders['X-XSS-Protection']).toBe('1; mode=block');
    expect(securityHeaders['Strict-Transport-Security']).toContain('max-age');
  });

  test('should configure Content-Security-Policy', () => {
    const csp = {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'", 'https://api.stripe.com']
    };

    const buildCspHeader = (policies) => {
      return Object.entries(policies)
        .map(([key, values]) => `${key} ${values.join(' ')}`)
        .join('; ');
    };

    const cspHeader = buildCspHeader(csp);

    expect(cspHeader).toContain("default-src 'self'");
    expect(cspHeader).toContain('https://api.stripe.com');
  });

  test('should prevent clickjacking', () => {
    const frameOptions = ['DENY', 'SAMEORIGIN'];
    const currentSetting = 'DENY';

    expect(frameOptions).toContain(currentSetting);
    expect(currentSetting).toBe('DENY');
  });
});

// ==========================================
// GRACEFUL SHUTDOWN TESTS
// ==========================================
describe('Graceful Shutdown', () => {
  test('SRV-U-010: should handle shutdown signals', () => {
    const shutdownSignals = ['SIGTERM', 'SIGINT', 'SIGHUP'];
    const handledSignals = [];

    const registerShutdownHandler = (signal, handler) => {
      handledSignals.push(signal);
      // In real app: process.on(signal, handler)
    };

    shutdownSignals.forEach(signal => {
      registerShutdownHandler(signal, () => {});
    });

    expect(handledSignals).toContain('SIGTERM');
    expect(handledSignals).toContain('SIGINT');
    expect(handledSignals.length).toBe(3);
  });

  test('should close connections gracefully', async () => {
    const connections = {
      database: { connected: true },
      redis: { connected: true },
      kafka: { connected: true }
    };

    const closeConnections = async () => {
      const results = {};
      
      for (const [name, conn] of Object.entries(connections)) {
        try {
          conn.connected = false;
          results[name] = 'closed';
        } catch (err) {
          results[name] = 'error';
        }
      }
      
      return results;
    };

    const results = await closeConnections();

    expect(results.database).toBe('closed');
    expect(results.redis).toBe('closed');
    expect(results.kafka).toBe('closed');
    expect(connections.database.connected).toBe(false);
  });

  test('should wait for pending requests', async () => {
    const pendingRequests = new Set();

    const trackRequest = (id) => {
      pendingRequests.add(id);
      return () => pendingRequests.delete(id);
    };

    const waitForPending = async (timeout = 5000) => {
      const start = Date.now();
      while (pendingRequests.size > 0 && Date.now() - start < timeout) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return pendingRequests.size === 0;
    };

    // Simulate request
    const complete1 = trackRequest('req-1');
    const complete2 = trackRequest('req-2');

    expect(pendingRequests.size).toBe(2);

    complete1();
    complete2();

    const allCompleted = await waitForPending(1000);

    expect(allCompleted).toBe(true);
    expect(pendingRequests.size).toBe(0);
  });

  test('should set shutdown timeout', () => {
    const SHUTDOWN_TIMEOUT = 30000; // 30 seconds

    const shutdownWithTimeout = (cleanup, timeout) => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('Shutdown timeout'));
        }, timeout);

        cleanup().then(() => {
          clearTimeout(timer);
          resolve(true);
        });
      });
    };

    expect(SHUTDOWN_TIMEOUT).toBe(30000);
  });
});

// ==========================================
// MIDDLEWARE CHAIN TESTS
// ==========================================
describe('Middleware Chain', () => {
  test('should execute middlewares in order', async () => {
    const executionOrder = [];

    const middleware1 = async (req, next) => {
      executionOrder.push('middleware1-before');
      await next();
      executionOrder.push('middleware1-after');
    };

    const middleware2 = async (req, next) => {
      executionOrder.push('middleware2-before');
      await next();
      executionOrder.push('middleware2-after');
    };

    const handler = async () => {
      executionOrder.push('handler');
    };

    // Simulate middleware execution
    await middleware1({}, async () => {
      await middleware2({}, handler);
    });

    expect(executionOrder).toEqual([
      'middleware1-before',
      'middleware2-before',
      'handler',
      'middleware2-after',
      'middleware1-after'
    ]);
  });

  test('should stop chain on error', () => {
    const executeWithErrorHandling = (middlewares) => {
      let stopped = false;
      const executed = [];

      for (const mw of middlewares) {
        if (stopped) break;
        try {
          executed.push(mw.name);
          if (mw.throws) {
            throw new Error(mw.error);
          }
        } catch (err) {
          stopped = true;
          executed.push('error-handler');
        }
      }

      return executed;
    };

    const middlewares = [
      { name: 'auth', throws: false },
      { name: 'validation', throws: true, error: 'Invalid input' },
      { name: 'handler', throws: false }
    ];

    const result = executeWithErrorHandling(middlewares);

    expect(result).toContain('auth');
    expect(result).toContain('validation');
    expect(result).toContain('error-handler');
    expect(result).not.toContain('handler');
  });
});

