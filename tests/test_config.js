/**
 * Test Configuration
 * Central configuration for all test suites
 */

module.exports = {
  // Supabase Configuration
  supabase: {
    url: 'https://rphjsyyppyrvkjuzlxun.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwaGpzeXlwcHlydmtqdXpseHVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzU3OTEsImV4cCI6MjA3NTk1MTc5MX0.AgyLFtjZbPwxIVRHpdq8phNY5DcB7FZQuBLycAFNacw'
  },

  // Test Data Configuration
  testData: {
    restaurant: {
      name: 'Test Restaurant',
      email: 'test@restaurant.com',
      password_hash: 'hashed_password_123',
      address: '123 Test Street',
      phone: '+1234567890'
    },
    admin: {
      name: 'Test Admin',
      email: 'admin@test.com',
      password_hash: 'hashed_password_123',
      role: 'owner'
    },
    staff: {
      name: 'Test Staff',
      email: 'staff@test.com',
      password_hash: 'hashed_password_123',
      role: 'waiter'
    },
    table: {
      table_number: 1,
      capacity: 4,
      status: 'available'
    },
    menuItem: {
      name: 'Test Menu Item',
      description: 'A test menu item',
      category: 'Main Course',
      cost: 12.99,
      available: true
    }
  },

  // Performance Test Configuration
  performance: {
    iterations: {
      small: 5,
      medium: 10,
      large: 20
    },
    concurrency: {
      low: 3,
      medium: 5,
      high: 10
    },
    timeouts: {
      short: 5000,
      medium: 10000,
      long: 30000
    }
  },

  // Security Test Configuration
  security: {
    sqlInjectionPayloads: [
      "'; DROP TABLE restaurants; --",
      "1' OR '1'='1",
      "admin'--",
      "1; DELETE FROM restaurants; --",
      "' UNION SELECT * FROM restaurants --"
    ],
    xssPayloads: [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '"><img src=x onerror=alert("XSS")>'
    ]
  },

  // Test Categories
  categories: {
    unit: ['validation', 'error_handling', 'input_sanitization'],
    integration: ['workflows', 'data_relationships', 'business_logic'],
    e2e: ['complete_scenarios', 'user_journeys', 'real_world_usage'],
    performance: ['load_testing', 'concurrency', 'response_times'],
    security: ['injection_attacks', 'xss_protection', 'authentication']
  },

  // Test Environment
  environment: {
    isDevelopment: process.env.NODE_ENV !== 'production',
    isCI: process.env.CI === 'true',
    isLocal: !process.env.CI
  }
};
