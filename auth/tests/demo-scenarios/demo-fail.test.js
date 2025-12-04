// ============================================
// KỊCH BẢN 1: TEST FAIL - Demo cho thuyết trình
// ============================================
// File này cố tình FAIL để demo monitoring

import { describe, test, expect } from '@jest/globals';

describe('🔴 Demo FAIL Tests - Phát hiện lỗi qua Monitoring', () => {
  
  describe('Bug: Email Validation bị sai', () => {
    test('FAIL: Email không có @ vẫn pass validation (BUG!)', () => {
      // Giả lập bug: regex sai
      const buggyEmailRegex = /^.+\..+$/; // Bug: không check @
      
      // Test này sẽ FAIL vì "invalidemail.com" không nên pass
      expect(buggyEmailRegex.test('invalidemail.com')).toBe(false);
      // Thực tế regex sai nên nó return true -> FAIL
    });
  });

  describe('Bug: Password quá yếu vẫn được chấp nhận', () => {
    test('FAIL: Password "123" không nên được chấp nhận', () => {
      // Giả lập bug: không check độ dài tối thiểu
      const buggyPasswordValidator = (pwd) => pwd && pwd.length > 0;
      
      // Test này sẽ FAIL vì "123" không đủ 6 ký tự
      expect(buggyPasswordValidator('123')).toBe(false);
      // Thực tế validator sai nên return true -> FAIL
    });

    test('FAIL: Password không có số vẫn được chấp nhận', () => {
      const buggyPasswordValidator = (pwd) => pwd && pwd.length >= 6;
      
      // Password nên có ít nhất 1 số
      expect(buggyPasswordValidator('abcdef')).toBe(false);
      // Validator không check số -> return true -> FAIL
    });
  });

  describe('Bug: Lỗi Logic đăng ký', () => {
    test('FAIL: Cho phép đăng ký với email đã tồn tại', () => {
      const existingUsers = ['user1@test.com', 'user2@test.com'];
      
      const buggyRegister = (email) => {
        // Bug: quên check email đã tồn tại
        return { success: true, message: 'User registered' };
      };
      
      const result = buggyRegister('user1@test.com');
      
      // Email đã tồn tại, không nên cho đăng ký
      expect(result.success).toBe(false);
      // Bug: vẫn return success -> FAIL
    });
  });

  describe('Bug: Security - Token không hết hạn', () => {
    test('FAIL: Token hết hạn vẫn valid', () => {
      const checkToken = (token) => {
        // Bug: không check expiry time
        return { valid: true };
      };
      
      const expiredToken = {
        userId: '123',
        exp: Date.now() - 3600000 // Hết hạn 1 giờ trước
      };
      
      const result = checkToken(expiredToken);
      
      // Token đã hết hạn, nên invalid
      expect(result.valid).toBe(false);
      // Bug: vẫn return valid -> FAIL
    });
  });

});
