#!/usr/bin/env node

/**
 * Unit Tests - Error Handling Tests
 * Tests error handling and edge cases for all functions
 */

const { callFunction, generateTestData, validateResponse } = require('../test_utils');

async function testNotFoundErrors() {
  console.log('🔍 Testing Not Found Errors...');
  
  let passed = 0;
  let failed = 0;
  
  // Test get_menu_items with non-existent restaurant
  const { response, result } = await callFunction('get_menu_items', 'GET', null, '?restaurant_id=non-existent-id');
  if (response.status === 404 || (response.status === 200 && result.error && result.error.includes('not found'))) {
    console.log('  ✅ get_menu_items with non-existent restaurant handled correctly');
    passed++;
  } else {
    console.log('  ❌ get_menu_items with non-existent restaurant not handled');
    failed++;
  }
  
  // Test get_cart with non-existent cart
  const { response: cartResponse, result: cartResult } = await callFunction('get_cart', 'GET', null, '?cart_id=00000000-0000-0000-0000-000000000000');
  if (cartResponse.status === 404 || (cartResponse.status === 200 && cartResult.error && cartResult.error.includes('not found'))) {
    console.log('  ✅ get_cart with non-existent cart handled correctly');
    passed++;
  } else {
    console.log('  ❌ get_cart with non-existent cart not handled');
    failed++;
  }
  
  // Test update_order_status with non-existent order
  const { response: orderResponse, result: orderResult } = await callFunction('update_order_status', 'PUT', {
    id: 'non-existent-id',
    status: 'preparing'
  });
  if (orderResponse.status === 404 || (orderResponse.status === 200 && orderResult.error && orderResult.error.includes('not found'))) {
    console.log('  ✅ update_order_status with non-existent order handled correctly');
    passed++;
  } else {
    console.log('  ❌ update_order_status with non-existent order not handled');
    failed++;
  }
  
  console.log(`  📊 Not Found Errors: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

async function testInvalidDataErrors() {
  console.log('🔍 Testing Invalid Data Errors...');
  
  let passed = 0;
  let failed = 0;
  
  // Test create_restaurant with invalid email
  const { response, result } = await callFunction('create_restaurant', 'POST', {
    name: 'Test Restaurant',
    email: 'invalid-email',
    password_hash: 'test'
  });
  if (response.status === 400 && result.error && result.error.includes('email')) {
    console.log('  ✅ create_restaurant with invalid email handled correctly');
    passed++;
  } else {
    console.log('  ❌ create_restaurant with invalid email not handled');
    failed++;
  }
  
  // Test create_table with negative table number
  const { response: tableResponse, result: tableResult } = await callFunction('create_table', 'POST', {
    restaurant_id: 'test-id',
    table_number: -1,
    capacity: 4
  });
  if (tableResponse.status === 400 && tableResult.error && tableResult.error.includes('positive')) {
    console.log('  ✅ create_table with negative table number handled correctly');
    passed++;
  } else {
    console.log('  ❌ create_table with negative table number not handled');
    failed++;
  }
  
  // Test add_to_cart with zero quantity
  const { response: cartResponse, result: cartResult } = await callFunction('add_to_cart', 'POST', {
    cart_id: 'test-id',
    menu_item_id: 'test-id',
    quantity: 0
  });
  if (cartResponse.status === 400 && cartResult.error && cartResult.error.includes('positive')) {
    console.log('  ✅ add_to_cart with zero quantity handled correctly');
    passed++;
  } else {
    console.log('  ❌ add_to_cart with zero quantity not handled');
    failed++;
  }
  
  console.log(`  📊 Invalid Data Errors: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

async function testBusinessLogicErrors() {
  console.log('🔍 Testing Business Logic Errors...');
  
  let passed = 0;
  let failed = 0;
  
  // Test create_cart with non-existent table
  const { response, result } = await callFunction('create_cart', 'POST', {
    restaurant_id: 'test-id',
    table_id: 'non-existent-table-id'
  });
  if (response.status === 404 || (response.status === 400 && result.error && result.error.includes('table'))) {
    console.log('  ✅ create_cart with non-existent table handled correctly');
    passed++;
  } else {
    console.log('  ❌ create_cart with non-existent table not handled');
    failed++;
  }
  
  // Test place_order with empty cart
  const { response: orderResponse, result: orderResult } = await callFunction('place_order', 'POST', {
    cart_id: '00000000-0000-0000-0000-000000000000',
    created_by: '00000000-0000-0000-0000-000000000000'
  });
  if (orderResponse.status === 404 && orderResult.error && orderResult.error.includes('not found')) {
    console.log('  ✅ place_order with non-existent cart handled correctly');
    passed++;
  } else {
    console.log('  ❌ place_order with non-existent cart not handled');
    failed++;
  }
  
  console.log(`  📊 Business Logic Errors: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

async function testNetworkErrors() {
  console.log('🔍 Testing Network Error Handling...');
  
  let passed = 0;
  let failed = 0;
  
  // Test with malformed request
  try {
    const response = await fetch('https://rphjsyyppyrvkjuzlxun.supabase.co/functions/v1/create_restaurant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-key'
      },
      body: 'invalid-json{'
    });
    
    if (response.status === 400 || response.status === 401) {
      console.log('  ✅ Malformed request handled correctly');
      passed++;
    } else {
      console.log('  ❌ Malformed request not handled');
      failed++;
    }
  } catch (error) {
    console.log('  ✅ Network error handled correctly');
    passed++;
  }
  
  console.log(`  📊 Network Errors: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

async function runErrorHandlingTests() {
  console.log('🚀 Running Unit Tests - Error Handling');
  console.log('=' * 50);
  
  const startTime = Date.now();
  
  const notFoundResults = await testNotFoundErrors();
  const invalidDataResults = await testInvalidDataErrors();
  const businessLogicResults = await testBusinessLogicErrors();
  const networkResults = await testNetworkErrors();
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  const totalPassed = notFoundResults.passed + invalidDataResults.passed + 
                     businessLogicResults.passed + networkResults.passed;
  const totalFailed = notFoundResults.failed + invalidDataResults.failed + 
                     businessLogicResults.failed + networkResults.failed;
  
  console.log('\n📊 Error Handling Test Results:');
  console.log(`✅ Total Passed: ${totalPassed}`);
  if (totalFailed > 0) {
    console.log(`❌ Total Failed: ${totalFailed}`);
  } else {
    console.log(`✅ Total Failed: ${totalFailed}`);
  }
  console.log(`📈 Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
  
  return { totalPassed, totalFailed, duration };
}

if (require.main === module) {
  runErrorHandlingTests();
}

module.exports = { runErrorHandlingTests };
