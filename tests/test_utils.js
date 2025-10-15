/**
 * Test Utilities
 * Common utilities for all test suites
 */

const config = require('./test_config');

/**
 * Make API call to Supabase function
 */
async function callFunction(functionName, method = 'GET', data = null, queryParams = '', customHeaders = {}) {
  const url = `${config.supabase.url}/functions/v1/${functionName}${queryParams}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.supabase.anonKey}`,
      ...customHeaders
    }
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return { response, result, error: null };
  } catch (error) {
    return { response: null, result: null, error: error.message };
  }
}

/**
 * Generate unique test data
 */
function generateTestData(type, overrides = {}) {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 10000);
  
  const baseData = {
    restaurant: {
      name: `Test Restaurant ${timestamp}`,
      email: `test${timestamp}@restaurant.com`,
      password_hash: 'hashed_password_123',
      address: '123 Test Street',
      phone: '+1234567890'
    },
    admin: {
      name: 'Test Admin',
      email: `admin${timestamp}@test.com`,
      password_hash: 'hashed_password_123',
      role: 'owner'
    },
    staff: {
      name: 'Test Staff',
      email: `staff${timestamp}@test.com`,
      password_hash: 'hashed_password_123',
      role: 'waiter'
    },
    table: {
      table_number: randomId,
      capacity: 4,
      status: 'available'
    },
    menuItem: {
      name: `Test Menu Item ${timestamp}`,
      description: 'A test menu item',
      category: 'Main Course',
      cost: 12.99,
      available: true
    }
  };
  
  return { ...baseData[type], ...overrides };
}

/**
 * Wait for specified time
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Measure execution time
 */
function measureTime(fn) {
  return async (...args) => {
    const start = Date.now();
    const result = await fn(...args);
    const end = Date.now();
    return { result, duration: end - start };
  };
}

/**
 * Retry function with exponential backoff
 */
async function retry(fn, maxAttempts = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
}

/**
 * Validate API response
 */
function validateResponse(response, result, expectedStatus = 200) {
  return {
    isValid: response && response.status === expectedStatus,
    isSuccess: result && result.success === true,
    hasData: result && result.data !== undefined,
    hasError: result && result.error !== undefined,
    status: response ? response.status : null,
    error: result ? result.error : null
  };
}

/**
 * Create test restaurant for other tests
 */
async function createTestRestaurant(overrides = {}) {
  const restaurantData = generateTestData('restaurant', overrides);
  const { response, result } = await callFunction('create_restaurant', 'POST', restaurantData);
  
  if (response.status === 200 && result.success) {
    return result.data;
  } else {
    throw new Error(`Failed to create test restaurant: ${result.error}`);
  }
}

/**
 * Create test staff for other tests
 */
async function createTestStaff(restaurantId, overrides = {}) {
  const staffData = generateTestData('staff', { ...overrides, restaurant_id: restaurantId });
  const { response, result } = await callFunction('create_staff', 'POST', staffData);
  
  if (response.status === 200 && result.success) {
    return result.data;
  } else {
    throw new Error(`Failed to create test staff: ${result.error}`);
  }
}

/**
 * Create test table for other tests
 */
async function createTestTable(restaurantId, overrides = {}) {
  const tableData = generateTestData('table', { ...overrides, restaurant_id: restaurantId });
  const { response, result } = await callFunction('create_table', 'POST', tableData);
  
  if (response.status === 200 && result.success) {
    return result.data;
  } else {
    throw new Error(`Failed to create test table: ${result.error}`);
  }
}

/**
 * Create test menu item for other tests
 */
async function createTestMenuItem(restaurantId, overrides = {}) {
  const menuItemData = generateTestData('menuItem', { ...overrides, restaurant_id: restaurantId });
  const { response, result } = await callFunction('create_menu_item', 'POST', menuItemData);
  
  if (response.status === 200 && result.success) {
    return result.data;
  } else {
    throw new Error(`Failed to create test menu item: ${result.error}`);
  }
}

/**
 * Run multiple tests in parallel
 */
async function runParallelTests(tests) {
  const results = await Promise.allSettled(tests.map(test => test()));
  return results.map((result, index) => ({
    testIndex: index,
    status: result.status,
    value: result.value,
    reason: result.reason
  }));
}

/**
 * Generate test report
 */
function generateTestReport(results) {
  const total = results.length;
  const passed = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  return {
    total,
    passed,
    failed,
    successRate: (passed / total) * 100,
    results
  };
}

/**
 * Log test results
 */
function logTestResults(report, testName = 'Test Suite') {
  console.log(`\n📊 ${testName} Results:`);
  console.log(`✅ Passed: ${report.passed}`);
  console.log(`❌ Failed: ${report.failed}`);
  console.log(`📈 Success Rate: ${report.successRate.toFixed(1)}%`);
  console.log(`📊 Total: ${report.total}`);
}

module.exports = {
  callFunction,
  generateTestData,
  sleep,
  measureTime,
  retry,
  validateResponse,
  createTestRestaurant,
  createTestStaff,
  createTestTable,
  createTestMenuItem,
  runParallelTests,
  generateTestReport,
  logTestResults
};
