/**
 * Demo Test - This test is designed to PASS for demonstration purposes
 * Used to show how the CI/CD pipeline handles successful tests
 */

describe('Demo Passed Test', () => {
  
  test('This test should PASS - Demo for CI/CD pipeline', () => {
    const expected = 'success';
    const actual = 'success';
    
    expect(actual).toBe(expected);
  });

  test('Another passing test - Basic math operations', () => {
    expect(1 + 1).toBe(2);
    expect(5 * 3).toBe(15);
    expect(10 / 2).toBe(5);
  });

  test('String operations should work correctly', () => {
    const greeting = 'Hello, FastFood!';
    expect(greeting).toContain('FastFood');
    expect(greeting.length).toBeGreaterThan(0);
  });

  test('Array operations should work correctly', () => {
    const services = ['auth', 'order', 'restaurant', 'payment'];
    expect(services).toHaveLength(4);
    expect(services).toContain('auth');
  });

});
