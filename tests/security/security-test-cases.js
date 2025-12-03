/**
 * Security Test Cases - FastFood Delivery Platform
 * Tests for common vulnerabilities (OWASP Top 10)
 */

// Test utilities
const testCases = {
  // ═══════════════════════════════════════════════════════════
  // 1. SQL/NoSQL INJECTION TESTS
  // ═══════════════════════════════════════════════════════════
  injection: {
    name: 'Injection Prevention',
    tests: [
      {
        id: 'SEC-INJ-001',
        name: 'NoSQL Injection in login email',
        payload: { email: { "$gt": "" }, password: "any" },
        endpoint: '/api/auth/login',
        expectedStatus: [400, 401],
        description: 'Should reject MongoDB operator injection'
      },
      {
        id: 'SEC-INJ-002',
        name: 'NoSQL Injection in password',
        payload: { email: "test@test.com", password: { "$ne": "" } },
        endpoint: '/api/auth/login',
        expectedStatus: [400, 401],
        description: 'Should reject MongoDB operator in password'
      },
      {
        id: 'SEC-INJ-003',
        name: 'NoSQL Injection in search',
        payload: { query: { "$where": "sleep(5000)" } },
        endpoint: '/api/restaurants/search',
        expectedStatus: [400],
        description: 'Should reject $where operator'
      },
      {
        id: 'SEC-INJ-004',
        name: 'Command Injection in file upload',
        payload: { filename: "test; rm -rf /" },
        endpoint: '/api/restaurants/upload',
        expectedStatus: [400],
        description: 'Should sanitize filename'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 2. BROKEN AUTHENTICATION TESTS
  // ═══════════════════════════════════════════════════════════
  authentication: {
    name: 'Authentication Security',
    tests: [
      {
        id: 'SEC-AUTH-001',
        name: 'Brute force protection',
        description: 'Should block after multiple failed attempts',
        attempts: 10,
        endpoint: '/api/auth/login',
        expectedStatus: 429
      },
      {
        id: 'SEC-AUTH-002',
        name: 'JWT token tampering',
        description: 'Should reject modified JWT tokens',
        modifiedToken: true,
        expectedStatus: 401
      },
      {
        id: 'SEC-AUTH-003',
        name: 'Expired token rejection',
        description: 'Should reject expired JWT tokens',
        expiredToken: true,
        expectedStatus: 401
      },
      {
        id: 'SEC-AUTH-004',
        name: 'Weak password rejection',
        payload: { email: "test@test.com", password: "123" },
        endpoint: '/api/auth/register',
        expectedStatus: 400,
        description: 'Should reject weak passwords'
      },
      {
        id: 'SEC-AUTH-005',
        name: 'Password in response',
        endpoint: '/api/auth/profile',
        expectedNotInResponse: ['password', 'hash'],
        description: 'Should not expose password in API response'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 3. XSS (CROSS-SITE SCRIPTING) TESTS
  // ═══════════════════════════════════════════════════════════
  xss: {
    name: 'XSS Prevention',
    tests: [
      {
        id: 'SEC-XSS-001',
        name: 'Script tag injection in name',
        payload: { name: '<script>alert("XSS")</script>' },
        endpoint: '/api/auth/register',
        expectedSanitized: true,
        description: 'Should sanitize script tags'
      },
      {
        id: 'SEC-XSS-002',
        name: 'Event handler injection',
        payload: { name: '<img onerror="alert(1)" src="x">' },
        endpoint: '/api/restaurants',
        expectedSanitized: true,
        description: 'Should sanitize event handlers'
      },
      {
        id: 'SEC-XSS-003',
        name: 'JavaScript URL injection',
        payload: { website: 'javascript:alert(1)' },
        endpoint: '/api/restaurants',
        expectedStatus: 400,
        description: 'Should reject javascript: URLs'
      },
      {
        id: 'SEC-XSS-004',
        name: 'Encoded script injection',
        payload: { name: '&lt;script&gt;alert(1)&lt;/script&gt;' },
        endpoint: '/api/restaurants',
        expectedSanitized: true,
        description: 'Should handle encoded scripts'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 4. BROKEN ACCESS CONTROL TESTS
  // ═══════════════════════════════════════════════════════════
  accessControl: {
    name: 'Access Control',
    tests: [
      {
        id: 'SEC-AC-001',
        name: 'IDOR - Access other user orders',
        endpoint: '/api/orders/{otherId}',
        userRole: 'customer',
        expectedStatus: 403,
        description: 'Customer should not access other user orders'
      },
      {
        id: 'SEC-AC-002',
        name: 'Admin endpoint access by customer',
        endpoint: '/api/admin/users',
        userRole: 'customer',
        expectedStatus: 403,
        description: 'Customer should not access admin endpoints'
      },
      {
        id: 'SEC-AC-003',
        name: 'Restaurant owner access control',
        endpoint: '/api/restaurants/{otherId}/menu',
        method: 'PUT',
        userRole: 'restaurant',
        expectedStatus: 403,
        description: 'Restaurant owner should not modify other restaurants'
      },
      {
        id: 'SEC-AC-004',
        name: 'Privilege escalation',
        payload: { role: 'admin' },
        endpoint: '/api/auth/profile',
        method: 'PUT',
        expectedStatus: 403,
        description: 'User should not be able to change own role to admin'
      },
      {
        id: 'SEC-AC-005',
        name: 'Horizontal privilege escalation',
        endpoint: '/api/users/{otherId}',
        method: 'DELETE',
        userRole: 'customer',
        expectedStatus: 403,
        description: 'User should not delete other users'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 5. SECURITY MISCONFIGURATION TESTS
  // ═══════════════════════════════════════════════════════════
  misconfiguration: {
    name: 'Security Misconfiguration',
    tests: [
      {
        id: 'SEC-MISC-001',
        name: 'CORS policy',
        endpoint: '/api/auth/login',
        method: 'OPTIONS',
        checkHeaders: ['Access-Control-Allow-Origin'],
        description: 'Should have proper CORS headers'
      },
      {
        id: 'SEC-MISC-002',
        name: 'Security headers presence',
        endpoint: '/api/health',
        expectedHeaders: [
          'X-Content-Type-Options',
          'X-Frame-Options',
          'X-XSS-Protection'
        ],
        description: 'Should include security headers'
      },
      {
        id: 'SEC-MISC-003',
        name: 'Error message exposure',
        payload: { email: "invalid" },
        endpoint: '/api/auth/login',
        notExpectedInResponse: ['stack', 'trace', 'mongoose'],
        description: 'Should not expose stack traces'
      },
      {
        id: 'SEC-MISC-004',
        name: 'Debug endpoint disabled',
        endpoint: '/api/debug',
        expectedStatus: 404,
        description: 'Debug endpoints should be disabled in production'
      },
      {
        id: 'SEC-MISC-005',
        name: 'API versioning security',
        endpoint: '/api/v0/auth/login',
        expectedStatus: 404,
        description: 'Old API versions should be disabled'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 6. SENSITIVE DATA EXPOSURE TESTS
  // ═══════════════════════════════════════════════════════════
  dataExposure: {
    name: 'Sensitive Data Protection',
    tests: [
      {
        id: 'SEC-DATA-001',
        name: 'Password not in response',
        endpoint: '/api/users',
        notExpectedFields: ['password', 'passwordHash', 'salt'],
        description: 'Should not return password fields'
      },
      {
        id: 'SEC-DATA-002',
        name: 'Credit card masking',
        endpoint: '/api/payments/methods',
        expectedMasked: ['cardNumber'],
        description: 'Should mask credit card numbers'
      },
      {
        id: 'SEC-DATA-003',
        name: 'HTTPS enforcement',
        description: 'Should redirect HTTP to HTTPS',
        checkHttps: true
      },
      {
        id: 'SEC-DATA-004',
        name: 'API key in URL rejection',
        endpoint: '/api/auth/login?apiKey=secret123',
        expectedStatus: 400,
        description: 'Should not accept API keys in URL'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 7. RATE LIMITING TESTS
  // ═══════════════════════════════════════════════════════════
  rateLimiting: {
    name: 'Rate Limiting',
    tests: [
      {
        id: 'SEC-RATE-001',
        name: 'Login rate limiting',
        endpoint: '/api/auth/login',
        requests: 100,
        timeWindow: 60,
        expectedStatus: 429,
        description: 'Should limit login attempts'
      },
      {
        id: 'SEC-RATE-002',
        name: 'API rate limiting',
        endpoint: '/api/restaurants',
        requests: 1000,
        timeWindow: 60,
        expectedStatus: 429,
        description: 'Should limit API requests'
      },
      {
        id: 'SEC-RATE-003',
        name: 'Password reset rate limiting',
        endpoint: '/api/auth/forgot-password',
        requests: 5,
        timeWindow: 300,
        expectedStatus: 429,
        description: 'Should limit password reset requests'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // 8. INPUT VALIDATION TESTS
  // ═══════════════════════════════════════════════════════════
  inputValidation: {
    name: 'Input Validation',
    tests: [
      {
        id: 'SEC-INPUT-001',
        name: 'Email format validation',
        payload: { email: 'notanemail', password: 'test123' },
        endpoint: '/api/auth/register',
        expectedStatus: 400,
        description: 'Should reject invalid email format'
      },
      {
        id: 'SEC-INPUT-002',
        name: 'Phone format validation',
        payload: { phone: '123' },
        endpoint: '/api/auth/register',
        expectedStatus: 400,
        description: 'Should reject invalid phone format'
      },
      {
        id: 'SEC-INPUT-003',
        name: 'Large payload rejection',
        payloadSize: 10 * 1024 * 1024, // 10MB
        endpoint: '/api/orders',
        expectedStatus: [413, 400],
        description: 'Should reject oversized payloads'
      },
      {
        id: 'SEC-INPUT-004',
        name: 'Prototype pollution prevention',
        payload: { "__proto__": { "admin": true } },
        endpoint: '/api/auth/register',
        expectedStatus: 400,
        description: 'Should prevent prototype pollution'
      },
      {
        id: 'SEC-INPUT-005',
        name: 'Path traversal prevention',
        endpoint: '/api/files/../../../etc/passwd',
        expectedStatus: [400, 404],
        description: 'Should prevent path traversal'
      }
    ]
  }
};

// Export for use in actual tests
module.exports = { testCases };

// Generate security test summary
console.log('🔒 Security Test Cases Summary');
console.log('================================');
let totalTests = 0;
for (const [category, data] of Object.entries(testCases)) {
  console.log(`\n${data.name}: ${data.tests.length} tests`);
  totalTests += data.tests.length;
  data.tests.forEach(test => {
    console.log(`  - ${test.id}: ${test.name}`);
  });
}
console.log(`\n================================`);
console.log(`Total Security Tests: ${totalTests}`);
