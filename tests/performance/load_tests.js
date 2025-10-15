#!/usr/bin/env node

/**
 * Performance Tests - Load Tests
 * Tests system performance under load
 */

const SUPABASE_URL = 'https://rphjsyyppyrvkjuzlxun.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwaGpzeXlwcHlydmtqdXpseHVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzU3OTEsImV4cCI6MjA3NTk1MTc5MX0.AgyLFtjZbPwxIVRHpdq8phNY5DcB7FZQuBLycAFNacw';

async function callFunction(functionName, method = 'GET', data = null, queryParams = '') {
  const url = `${SUPABASE_URL}/functions/v1/${functionName}${queryParams}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return { response, result, error: null, duration: Date.now() };
  } catch (error) {
    return { response: null, result: null, error: error.message, duration: Date.now() };
  }
}

async function measureFunctionPerformance(functionName, method, data, iterations = 10) {
  console.log(`⚡ Testing ${functionName} performance (${iterations} iterations)...`);
  
  const results = [];
  const startTime = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    const iterationStart = Date.now();
    const result = await callFunction(functionName, method, data);
    const iterationEnd = Date.now();
    
    results.push({
      success: result.response && result.response.status === 200,
      duration: iterationEnd - iterationStart,
      error: result.error
    });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const endTime = Date.now();
  const totalDuration = endTime - startTime;
  
  const successfulResults = results.filter(r => r.success);
  const failedResults = results.filter(r => !r.success);
  
  const avgDuration = successfulResults.length > 0 
    ? successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length 
    : 0;
  
  const minDuration = successfulResults.length > 0 
    ? Math.min(...successfulResults.map(r => r.duration)) 
    : 0;
  
  const maxDuration = successfulResults.length > 0 
    ? Math.max(...successfulResults.map(r => r.duration)) 
    : 0;
  
  console.log(`  📊 Results:`);
  console.log(`    ✅ Successful: ${successfulResults.length}/${iterations}`);
  console.log(`    ❌ Failed: ${failedResults.length}/${iterations}`);
  console.log(`    ⏱️  Average: ${avgDuration.toFixed(2)}ms`);
  console.log(`    ⚡ Fastest: ${minDuration}ms`);
  console.log(`    🐌 Slowest: ${maxDuration}ms`);
  console.log(`    📈 Total time: ${totalDuration}ms`);
  
  return {
    functionName,
    iterations,
    successful: successfulResults.length,
    failed: failedResults.length,
    avgDuration,
    minDuration,
    maxDuration,
    totalDuration
  };
}

async function testConcurrentRequests(functionName, method, data, concurrency = 5) {
  console.log(`🔄 Testing ${functionName} concurrency (${concurrency} concurrent requests)...`);
  
  const startTime = Date.now();
  const promises = [];
  
  for (let i = 0; i < concurrency; i++) {
    promises.push(callFunction(functionName, method, data));
  }
  
  const results = await Promise.all(promises);
  const endTime = Date.now();
  const totalDuration = endTime - startTime;
  
  const successful = results.filter(r => r.response && r.response.status === 200);
  const failed = results.filter(r => !r.response || r.response.status !== 200);
  
  console.log(`  📊 Concurrent Results:`);
  console.log(`    ✅ Successful: ${successful.length}/${concurrency}`);
  console.log(`    ❌ Failed: ${failed.length}/${concurrency}`);
  console.log(`    ⏱️  Total time: ${totalDuration}ms`);
  console.log(`    📈 Requests/second: ${(concurrency / (totalDuration / 1000)).toFixed(2)}`);
  
  return {
    functionName,
    concurrency,
    successful: successful.length,
    failed: failed.length,
    totalDuration,
    requestsPerSecond: concurrency / (totalDuration / 1000)
  };
}

async function testMenuItemsLoad() {
  console.log('🍔 Testing Menu Items Load Performance...');
  
  // First create a restaurant for testing
  const restaurantData = {
    name: `Load Test Restaurant ${Date.now()}`,
    email: `loadtest${Date.now()}@restaurant.com`,
    password_hash: 'hashed_password_123'
  };
  
  const { response: restaurantResponse, result: restaurantResult } = await callFunction('create_restaurant', 'POST', restaurantData);
  if (restaurantResponse.status !== 200 || !restaurantResult.success) {
    console.log('❌ Failed to create test restaurant');
    return;
  }
  
  const restaurantId = restaurantResult.data.id;
  console.log(`✅ Test restaurant created: ${restaurantId}`);
  
  // Test get_menu_items performance
  const menuPerformance = await measureFunctionPerformance(
    'get_menu_items',
    'GET',
    null,
    `?restaurant_id=${restaurantId}`,
    20
  );
  
  // Test create_menu_item performance
  const menuItemData = {
    restaurant_id: restaurantId,
    name: 'Load Test Item',
    category: 'Test',
    cost: 10.99,
    available: true
  };
  
  const createPerformance = await measureFunctionPerformance(
    'create_menu_item',
    'POST',
    menuItemData,
    10
  );
  
  return { menuPerformance, createPerformance };
}

async function testCartOperationsLoad() {
  console.log('🛒 Testing Cart Operations Load Performance...');
  
  // Create test data
  const restaurantData = {
    name: `Cart Load Test Restaurant ${Date.now()}`,
    email: `cartloadtest${Date.now()}@restaurant.com`,
    password_hash: 'hashed_password_123'
  };
  
  const { response: restaurantResponse, result: restaurantResult } = await callFunction('create_restaurant', 'POST', restaurantData);
  if (restaurantResponse.status !== 200 || !restaurantResult.success) {
    console.log('❌ Failed to create test restaurant');
    return;
  }
  
  const restaurantId = restaurantResult.data.id;
  
  // Create table
  const tableData = {
    restaurant_id: restaurantId,
    table_number: 999,
    capacity: 4
  };
  
  const { response: tableResponse, result: tableResult } = await callFunction('create_table', 'POST', tableData);
  if (tableResponse.status !== 200 || !tableResult.success) {
    console.log('❌ Failed to create test table');
    return;
  }
  
  const tableId = tableResult.data.id;
  
  // Create menu item
  const menuItemData = {
    restaurant_id: restaurantId,
    name: 'Cart Load Test Item',
    category: 'Test',
    cost: 10.99,
    available: true
  };
  
  const { response: menuResponse, result: menuResult } = await callFunction('create_menu_item', 'POST', menuItemData);
  if (menuResponse.status !== 200 || !menuResult.success) {
    console.log('❌ Failed to create test menu item');
    return;
  }
  
  const menuItemId = menuResult.data.id;
  
  // Create cart
  const cartData = {
    restaurant_id: restaurantId,
    table_id: tableId
  };
  
  const { response: cartResponse, result: cartResult } = await callFunction('create_cart', 'POST', cartData);
  if (cartResponse.status !== 200 || !cartResult.success) {
    console.log('❌ Failed to create test cart');
    return;
  }
  
  const cartId = cartResult.data.id;
  
  // Test add_to_cart performance
  const addToCartData = {
    cart_id: cartId,
    menu_item_id: menuItemId,
    quantity: 1,
    notes: 'Load test'
  };
  
  const addPerformance = await measureFunctionPerformance(
    'add_to_cart',
    'POST',
    addToCartData,
    15
  );
  
  // Test get_cart performance
  const getCartPerformance = await measureFunctionPerformance(
    'get_cart',
    'GET',
    null,
    `?cart_id=${cartId}`,
    20
  );
  
  return { addPerformance, getCartPerformance };
}

async function testConcurrentUsers() {
  console.log('👥 Testing Concurrent Users Scenario...');
  
  // Simulate multiple users creating restaurants simultaneously
  const concurrentRestaurants = await testConcurrentRequests(
    'create_restaurant',
    'POST',
    {
      name: 'Concurrent Test Restaurant',
      email: 'concurrent@test.com',
      password_hash: 'hashed_password_123'
    },
    10
  );
  
  // Simulate multiple users getting menu items
  const concurrentMenuItems = await testConcurrentRequests(
    'get_menu_items',
    'GET',
    null,
    '?restaurant_id=test-id', // This will fail but tests concurrency
    15
  );
  
  return { concurrentRestaurants, concurrentMenuItems };
}

async function runLoadTests() {
  console.log('🚀 Running Performance Tests - Load Tests');
  console.log('=' * 60);
  
  const startTime = Date.now();
  
  // Test 1: Menu Items Load
  const menuResults = await testMenuItemsLoad();
  
  // Test 2: Cart Operations Load
  const cartResults = await testCartOperationsLoad();
  
  // Test 3: Concurrent Users
  const concurrentResults = await testConcurrentUsers();
  
  const endTime = Date.now();
  const totalDuration = (endTime - startTime) / 1000;
  
  console.log('\n📊 Performance Test Summary:');
  console.log('=' * 40);
  console.log(`⏱️  Total test duration: ${totalDuration.toFixed(2)}s`);
  
  if (menuResults) {
    console.log(`\n🍔 Menu Items Performance:`);
    console.log(`  📋 Get menu items: ${menuResults.menuPerformance.avgDuration.toFixed(2)}ms avg`);
    console.log(`  ➕ Create menu item: ${menuResults.createPerformance.avgDuration.toFixed(2)}ms avg`);
  }
  
  if (cartResults) {
    console.log(`\n🛒 Cart Operations Performance:`);
    console.log(`  ➕ Add to cart: ${cartResults.addPerformance.avgDuration.toFixed(2)}ms avg`);
    console.log(`  📋 Get cart: ${cartResults.getCartPerformance.avgDuration.toFixed(2)}ms avg`);
  }
  
  if (concurrentResults) {
    console.log(`\n👥 Concurrent Users Performance:`);
    console.log(`  🏪 Create restaurant: ${concurrentResults.concurrentRestaurants.requestsPerSecond.toFixed(2)} req/s`);
    console.log(`  📋 Get menu items: ${concurrentResults.concurrentMenuItems.requestsPerSecond.toFixed(2)} req/s`);
  }
  
  console.log('\n🎯 Load tests completed!');
}

if (require.main === module) {
  runLoadTests();
}

module.exports = { runLoadTests };
