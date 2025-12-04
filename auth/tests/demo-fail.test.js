/**
 * Demo Test - This test is designed to FAIL for demonstration purposes
 * Used to show how the CI/CD pipeline handles test failures
 */

describe('Demo Failed Test', () => {
  
  test('This test should FAIL - Demo for CI/CD pipeline', () => {
    // This assertion will fail intentionally
    const expected = 'success';
    const actual = 'failure';
    
    expect(actual).toBe(expected);
  });

  test('Another failing test - Authentication should reject invalid token', () => {
    const invalidToken = 'invalid-token-12345';
    const isValid = false;
    
    // This will fail - expecting true but got false
    expect(isValid).toBe(true);
  });

});
