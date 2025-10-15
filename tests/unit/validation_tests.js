#!/usr/bin/env node

/**
 * Unit Tests - Validation Tests
 * Tests input validation for all functions
 */

const { callFunction } = require('../test_utils');

async function testValidation(testName, functionName, method, invalidData, expectedError) {
  console.log(`🧪 Testing ${testName}...`);
  
  const { response, result, error } = await callFunction(functionName, method, invalidData);
  
  if (error) {
    console.log(`❌ Network error: ${error}`);
    return false;
  }
  
  if (response.status === 400 && result.error && result.error.includes(expectedError)) {
    console.log(`✅ Validation working: ${result.error}`);
    return true;
  } else {
    console.log(`❌ Expected validation error, got: ${result.error || 'No error'}`);
    return false;
  }
}

async function runValidationTests() {
  console.log('🚀 Running Unit Tests - Validation Tests');
  console.log('=' * 50);
  
  let passed = 0;
  let failed = 0;
  
  // Test create_restaurant validation
  const restaurantTests = [
    {
      name: 'Missing required fields',
      data: { name: 'Test' },
      expected: 'Missing required fields'
    },
    {
      name: 'Invalid email format',
      data: { name: 'Test', email: 'invalid-email', password_hash: 'test' },
      expected: 'Invalid email format'
    },
    {
      name: 'Empty name',
      data: { name: '', email: 'test@test.com', password_hash: 'test' },
      expected: 'Missing required fields'
    }
  ];
  
  for (const test of restaurantTests) {
    const success = await testValidation(
      `create_restaurant - ${test.name}`,
      'create_restaurant',
      'POST',
      test.data,
      test.expected
    );
    if (success) passed++; else failed++;
  }
  
  // Test create_menu_item validation
  const menuTests = [
    {
      name: 'Missing required fields',
      data: { name: 'Test Item' },
      expected: 'Missing required fields'
    },
    {
      name: 'Negative cost',
      data: { name: 'Test', restaurant_id: 'test', category: 'test', cost: -10 },
      expected: 'Cost must be non-negative'
    }
  ];
  
  for (const test of menuTests) {
    const success = await testValidation(
      `create_menu_item - ${test.name}`,
      'create_menu_item',
      'POST',
      test.data,
      test.expected
    );
    if (success) passed++; else failed++;
  }
  
  // Test create_table validation
  const tableTests = [
    {
      name: 'Missing required fields',
      data: { table_number: 1 },
      expected: 'Missing required fields'
    },
    {
      name: 'Invalid table number',
      data: { restaurant_id: 'test', table_number: -1 },
      expected: 'Table number must be positive'
    },
    {
      name: 'Invalid capacity',
      data: { restaurant_id: 'test', table_number: 1, capacity: 0 },
      expected: 'Capacity must be positive'
    }
  ];
  
  for (const test of tableTests) {
    const success = await testValidation(
      `create_table - ${test.name}`,
      'create_table',
      'POST',
      test.data,
      test.expected
    );
    if (success) passed++; else failed++;
  }
  
  // Test add_to_cart validation
  const cartTests = [
    {
      name: 'Missing required fields',
      data: { cart_id: 'test' },
      expected: 'Missing required fields'
    },
    {
      name: 'Invalid quantity',
      data: { cart_id: 'test', menu_item_id: 'test', quantity: 0 },
      expected: 'Quantity must be positive'
    }
  ];
  
  for (const test of cartTests) {
    const success = await testValidation(
      `add_to_cart - ${test.name}`,
      'add_to_cart',
      'POST',
      test.data,
      test.expected
    );
    if (success) passed++; else failed++;
  }
  
  // Test place_order validation
  const orderTests = [
    {
      name: 'Missing required fields',
      data: { cart_id: 'test' },
      expected: 'Missing required fields'
    }
  ];
  
  for (const test of orderTests) {
    const success = await testValidation(
      `place_order - ${test.name}`,
      'place_order',
      'POST',
      test.data,
      test.expected
    );
    if (success) passed++; else failed++;
  }
  
  console.log('\n📊 Validation Test Results:');
  console.log(`✅ Passed: ${passed}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}`);
  } else {
    console.log(`✅ Failed: ${failed}`);
  }
  console.log(`📈 Total: ${passed + failed}`);
  
  return { passed, failed };
}

if (require.main === module) {
  runValidationTests();
}

module.exports = { runValidationTests };
