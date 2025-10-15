#!/usr/bin/env node

/**
 * Integration Tests - Restaurant Workflow Tests
 * Tests complete restaurant management workflows
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
    return { response, result, error: null };
  } catch (error) {
    return { response: null, result: null, error: error.message };
  }
}

async function testCompleteRestaurantSetup() {
  console.log('🏪 Testing Complete Restaurant Setup Workflow...');
  
  const timestamp = Date.now();
  const testData = {
    restaurant: {
      name: `Integration Test Restaurant ${timestamp}`,
      email: `integration${timestamp}@test.com`,
      password_hash: 'hashed_password_123',
      address: '123 Integration Street',
      phone: '+1234567890'
    },
    admin: {
      name: 'Integration Admin',
      email: `admin${timestamp}@test.com`,
      password_hash: 'hashed_password_123',
      role: 'owner'
    },
    staff: {
      name: 'Integration Waiter',
      email: `waiter${timestamp}@test.com`,
      password_hash: 'hashed_password_123',
      role: 'waiter'
    },
    table: {
      table_number: Math.floor(Math.random() * 1000) + 1,
      capacity: 4,
      status: 'available'
    },
    menuItems: [
      {
        name: 'Integration Burger',
        description: 'A delicious integration test burger',
        category: 'Main Course',
        cost: 15.99,
        available: true
      },
      {
        name: 'Integration Salad',
        description: 'Fresh integration salad',
        category: 'Appetizer',
        cost: 8.99,
        available: true
      },
      {
        name: 'Integration Dessert',
        description: 'Sweet integration dessert',
        category: 'Dessert',
        cost: 6.99,
        available: true
      }
    ]
  };
  
  let results = { passed: 0, failed: 0, steps: [] };
  
  // Step 1: Create Restaurant
  console.log('  📝 Step 1: Creating restaurant...');
  const { response: restaurantResponse, result: restaurantResult } = await callFunction('create_restaurant', 'POST', testData.restaurant);
  if (restaurantResponse.status === 200 && restaurantResult.success) {
    testData.restaurant.id = restaurantResult.data.id;
    results.passed++;
    results.steps.push('✅ Restaurant created');
    console.log('    ✅ Restaurant created successfully');
  } else {
    results.failed++;
    results.steps.push('❌ Restaurant creation failed');
    console.log('    ❌ Restaurant creation failed');
    return results;
  }
  
  // Step 2: Create Admin
  console.log('  👨‍💼 Step 2: Creating admin...');
  const adminData = { ...testData.admin, restaurant_id: testData.restaurant.id };
  const { response: adminResponse, result: adminResult } = await callFunction('create_admin', 'POST', adminData);
  if (adminResponse.status === 200 && adminResult.success) {
    testData.admin.id = adminResult.data.id;
    results.passed++;
    results.steps.push('✅ Admin created');
    console.log('    ✅ Admin created successfully');
  } else {
    results.failed++;
    results.steps.push('❌ Admin creation failed');
    console.log('    ❌ Admin creation failed');
  }
  
  // Step 3: Create Staff
  console.log('  👥 Step 3: Creating staff...');
  const staffData = { ...testData.staff, restaurant_id: testData.restaurant.id };
  const { response: staffResponse, result: staffResult } = await callFunction('create_staff', 'POST', staffData);
  if (staffResponse.status === 200 && staffResult.success) {
    testData.staff.id = staffResult.data.id;
    results.passed++;
    results.steps.push('✅ Staff created');
    console.log('    ✅ Staff created successfully');
  } else {
    results.failed++;
    results.steps.push('❌ Staff creation failed');
    console.log('    ❌ Staff creation failed');
  }
  
  // Step 4: Create Table
  console.log('  🪑 Step 4: Creating table...');
  const tableData = { ...testData.table, restaurant_id: testData.restaurant.id };
  const { response: tableResponse, result: tableResult } = await callFunction('create_table', 'POST', tableData);
  if (tableResponse.status === 200 && tableResult.success) {
    testData.table.id = tableResult.data.id;
    results.passed++;
    results.steps.push('✅ Table created');
    console.log('    ✅ Table created successfully');
  } else {
    results.failed++;
    results.steps.push('❌ Table creation failed');
    console.log('    ❌ Table creation failed');
  }
  
  // Step 5: Create Menu Items
  console.log('  🍔 Step 5: Creating menu items...');
  testData.menuItems = [];
  for (let i = 0; i < testData.menuItems.length; i++) {
    const menuItemData = { ...testData.menuItems[i], restaurant_id: testData.restaurant.id };
    const { response: menuResponse, result: menuResult } = await callFunction('create_menu_item', 'POST', menuItemData);
    if (menuResponse.status === 200 && menuResult.success) {
      testData.menuItems.push(menuResult.data);
      results.passed++;
      results.steps.push(`✅ Menu item ${i + 1} created`);
      console.log(`    ✅ Menu item ${i + 1} created successfully`);
    } else {
      results.failed++;
      results.steps.push(`❌ Menu item ${i + 1} creation failed`);
      console.log(`    ❌ Menu item ${i + 1} creation failed`);
    }
  }
  
  // Step 6: Get Menu Items
  console.log('  📋 Step 6: Retrieving menu items...');
  const { response: getMenuResponse, result: getMenuResult } = await callFunction('get_menu_items', 'GET', null, `?restaurant_id=${testData.restaurant.id}`);
  if (getMenuResponse.status === 200 && getMenuResult.success) {
    results.passed++;
    results.steps.push(`✅ Retrieved ${getMenuResult.data.length} menu items`);
    console.log(`    ✅ Retrieved ${getMenuResult.data.length} menu items`);
  } else {
    results.failed++;
    results.steps.push('❌ Menu items retrieval failed');
    console.log('    ❌ Menu items retrieval failed');
  }
  
  // Step 7: Get Staff
  console.log('  👥 Step 7: Retrieving staff...');
  const { response: getStaffResponse, result: getStaffResult } = await callFunction('get_staff', 'GET', null, `?restaurant_id=${testData.restaurant.id}`);
  if (getStaffResponse.status === 200 && getStaffResult.success) {
    results.passed++;
    results.steps.push(`✅ Retrieved ${getStaffResult.data.length} staff members`);
    console.log(`    ✅ Retrieved ${getStaffResult.data.length} staff members`);
  } else {
    results.failed++;
    results.steps.push('❌ Staff retrieval failed');
    console.log('    ❌ Staff retrieval failed');
  }
  
  // Step 8: Get Tables
  console.log('  🪑 Step 8: Retrieving tables...');
  const { response: getTablesResponse, result: getTablesResult } = await callFunction('get_tables', 'GET', null, `?restaurant_id=${testData.restaurant.id}`);
  if (getTablesResponse.status === 200 && getTablesResult.success) {
    results.passed++;
    results.steps.push(`✅ Retrieved ${getTablesResult.data.length} tables`);
    console.log(`    ✅ Retrieved ${getTablesResult.data.length} tables`);
  } else {
    results.failed++;
    results.steps.push('❌ Tables retrieval failed');
    console.log('    ❌ Tables retrieval failed');
  }
  
  return { ...results, testData };
}

async function testOrderWorkflow(testData) {
  console.log('📝 Testing Order Workflow...');
  
  let results = { passed: 0, failed: 0, steps: [] };
  
  // Step 1: Create Cart
  console.log('  🛒 Step 1: Creating cart...');
  const cartData = {
    restaurant_id: testData.restaurant.id,
    table_id: testData.table.id
  };
  const { response: cartResponse, result: cartResult } = await callFunction('create_cart', 'POST', cartData);
  if (cartResponse.status === 200 && cartResult.success) {
    testData.cart = cartResult.data;
    results.passed++;
    results.steps.push('✅ Cart created');
    console.log('    ✅ Cart created successfully');
  } else {
    results.failed++;
    results.steps.push('❌ Cart creation failed');
    console.log('    ❌ Cart creation failed');
    return results;
  }
  
  // Step 2: Add Items to Cart
  console.log('  ➕ Step 2: Adding items to cart...');
  for (let i = 0; i < testData.menuItems.length; i++) {
    const cartItemData = {
      cart_id: testData.cart.id,
      menu_item_id: testData.menuItems[i].id,
      quantity: i + 1,
      notes: `Test note ${i + 1}`
    };
    const { response: addItemResponse, result: addItemResult } = await callFunction('add_to_cart', 'POST', cartItemData);
    if (addItemResponse.status === 200 && addItemResult.success) {
      results.passed++;
      results.steps.push(`✅ Item ${i + 1} added to cart`);
      console.log(`    ✅ Item ${i + 1} added to cart`);
    } else {
      results.failed++;
      results.steps.push(`❌ Item ${i + 1} addition failed`);
      console.log(`    ❌ Item ${i + 1} addition failed`);
    }
  }
  
  // Step 3: Get Cart
  console.log('  🛒 Step 3: Retrieving cart...');
  const { response: getCartResponse, result: getCartResult } = await callFunction('get_cart', 'GET', null, `?cart_id=${testData.cart.id}`);
  if (getCartResponse.status === 200 && getCartResult.success) {
    results.passed++;
    results.steps.push(`✅ Cart retrieved with ${getCartResult.data.cart_items.length} items`);
    console.log(`    ✅ Cart retrieved with ${getCartResult.data.cart_items.length} items`);
  } else {
    results.failed++;
    results.steps.push('❌ Cart retrieval failed');
    console.log('    ❌ Cart retrieval failed');
  }
  
  // Step 4: Place Order
  console.log('  📝 Step 4: Placing order...');
  const orderData = {
    cart_id: testData.cart.id,
    created_by: testData.staff.id
  };
  const { response: orderResponse, result: orderResult } = await callFunction('place_order', 'POST', orderData);
  if (orderResponse.status === 200 && orderResult.success) {
    testData.order = orderResult.data;
    results.passed++;
    results.steps.push(`✅ Order placed with total $${orderResult.data.total_amount}`);
    console.log(`    ✅ Order placed with total $${orderResult.data.total_amount}`);
  } else {
    results.failed++;
    results.steps.push('❌ Order placement failed');
    console.log('    ❌ Order placement failed');
    return results;
  }
  
  // Step 5: Get Orders
  console.log('  📋 Step 5: Retrieving orders...');
  const { response: getOrdersResponse, result: getOrdersResult } = await callFunction('get_orders', 'GET', null, `?restaurant_id=${testData.restaurant.id}`);
  if (getOrdersResponse.status === 200 && getOrdersResult.success) {
    results.passed++;
    results.steps.push(`✅ Retrieved ${getOrdersResult.data.length} orders`);
    console.log(`    ✅ Retrieved ${getOrdersResult.data.length} orders`);
  } else {
    results.failed++;
    results.steps.push('❌ Orders retrieval failed');
    console.log('    ❌ Orders retrieval failed');
  }
  
  // Step 6: Update Order Status
  console.log('  ✏️ Step 6: Updating order status...');
  const statuses = ['preparing', 'served', 'completed'];
  for (const status of statuses) {
    const updateData = {
      id: testData.order.id,
      status: status
    };
    const { response: updateResponse, result: updateResult } = await callFunction('update_order_status', 'PUT', updateData);
    if (updateResponse.status === 200 && updateResult.success) {
      results.passed++;
      results.steps.push(`✅ Order status updated to ${status}`);
      console.log(`    ✅ Order status updated to ${status}`);
    } else {
      results.failed++;
      results.steps.push(`❌ Order status update to ${status} failed`);
      console.log(`    ❌ Order status update to ${status} failed`);
    }
  }
  
  return results;
}

async function runIntegrationTests() {
  console.log('🚀 Running Integration Tests - Restaurant Workflow');
  console.log('=' * 60);
  
  const setupResults = await testCompleteRestaurantSetup();
  console.log('\n📊 Restaurant Setup Results:');
  console.log(`✅ Passed: ${setupResults.passed}`);
  if (setupResults.failed > 0) {
    console.log(`❌ Failed: ${setupResults.failed}`);
  } else {
    console.log(`✅ Failed: ${setupResults.failed}`);
  }
  
  if (setupResults.testData) {
    const orderResults = await testOrderWorkflow(setupResults.testData);
    console.log('\n📊 Order Workflow Results:');
    console.log(`✅ Passed: ${orderResults.passed}`);
    if (orderResults.failed > 0) {
      console.log(`❌ Failed: ${orderResults.failed}`);
    } else {
      console.log(`✅ Failed: ${orderResults.failed}`);
    }
    
    const totalPassed = setupResults.passed + orderResults.passed;
    const totalFailed = setupResults.failed + orderResults.failed;
    
    console.log('\n📊 Overall Integration Test Results:');
    console.log(`✅ Total Passed: ${totalPassed}`);
    if (totalFailed > 0) {
      console.log(`❌ Total Failed: ${totalFailed}`);
    } else {
      console.log(`✅ Total Failed: ${totalFailed}`);
    }
    console.log(`📈 Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  }
}

if (require.main === module) {
  runIntegrationTests();
}

module.exports = { runIntegrationTests };
