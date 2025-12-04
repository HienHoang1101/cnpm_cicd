// ============================================
// KỊCH BẢN 2: TEST PASS - Sau khi fix bug
// ============================================
// File này demo việc fix bug và test PASS

import { describe, test, expect } from '@jest/globals';

describe('🟢 Demo PASS Tests - Đã Fix Bug', () => {
  
  describe('Fixed: Email Validation đúng', () => {
    test('PASS: Email validation chính xác', () => {
      // Đã fix: regex đúng với @
      const correctEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(correctEmailRegex.test('test@example.com')).toBe(true);
      expect(correctEmailRegex.test('invalidemail.com')).toBe(false); // Giờ đây PASS
      expect(correctEmailRegex.test('no-at-sign.com')).toBe(false);
    });
  });

  describe('Fixed: Password validation nghiêm ngặt', () => {
    test('PASS: Password phải có ít nhất 6 ký tự', () => {
      const correctPasswordValidator = (pwd) => pwd && pwd.length >= 6;
      
      expect(correctPasswordValidator('123456')).toBe(true);
      expect(correctPasswordValidator('123')).toBe(false); // Giờ đây PASS
      expect(correctPasswordValidator('ab')).toBe(false);
    });

    test('PASS: Password phải có ít nhất 1 số', () => {
      const strongPasswordValidator = (pwd) => {
        return pwd && pwd.length >= 6 && /\d/.test(pwd);
      };
      
      expect(strongPasswordValidator('password1')).toBe(true);
      expect(strongPasswordValidator('abcdef')).toBe(false); // Giờ đây PASS
      expect(strongPasswordValidator('abc123')).toBe(true);
    });
  });

  describe('Fixed: Logic đăng ký an toàn', () => {
    test('PASS: Không cho đăng ký với email đã tồn tại', () => {
      const existingUsers = ['user1@test.com', 'user2@test.com'];
      
      const correctRegister = (email) => {
        // Fixed: check email đã tồn tại
        if (existingUsers.includes(email)) {
          return { success: false, message: 'Email already exists' };
        }
        return { success: true, message: 'User registered' };
      };
      
      expect(correctRegister('user1@test.com').success).toBe(false); // Giờ đây PASS
      expect(correctRegister('newuser@test.com').success).toBe(true);
    });
  });

  describe('Fixed: Security - Token expiry', () => {
    test('PASS: Token hết hạn bị reject', () => {
      const checkToken = (token) => {
        // Fixed: check expiry time
        if (token.exp < Date.now()) {
          return { valid: false, reason: 'Token expired' };
        }
        return { valid: true };
      };
      
      const expiredToken = { userId: '123', exp: Date.now() - 3600000 };
      const validToken = { userId: '456', exp: Date.now() + 3600000 };
      
      expect(checkToken(expiredToken).valid).toBe(false); // Giờ đây PASS
      expect(checkToken(validToken).valid).toBe(true);
    });
  });

  describe('Additional Security Tests', () => {
    test('PASS: SQL Injection prevention', () => {
      const sanitizeInput = (input) => {
        const dangerous = ["'", '"', ';', '--', '/*', '*/'];
        return !dangerous.some(char => input.includes(char));
      };
      
      expect(sanitizeInput("Robert'); DROP TABLE users;--")).toBe(false);
      expect(sanitizeInput("Normal User Name")).toBe(true);
    });

    test('PASS: XSS prevention', () => {
      const escapeHtml = (text) => {
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
      
      const malicious = '<script>alert("XSS")</script>';
      const escaped = escapeHtml(malicious);
      
      expect(escaped).not.toContain('<script>');
      expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });
  });

});
