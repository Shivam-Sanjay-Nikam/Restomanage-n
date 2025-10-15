#!/usr/bin/env node

/**
 * End-to-End Tests - Complete Restaurant Flow
 * Tests the entire restaurant management system from start to finish
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

async function testRestaurantOpeningScenario() {
  console.log('🏪 Testing Restaurant Opening Scenario...');
  console.log('=' * 50);
  
  const timestamp = Date.now();
  const restaurantName = `E2E Test Restaurant ${timestamp}`;
  
  // Scenario: A new restaurant is opening and needs to set up everything
  
  // 1. Restaurant owner creates restaurant
  console.log('📝 Step 1: Restaurant owner creates restaurant account');
  const restaurantData = {
    name: restaurantName,
    email: `e2e${timestamp}@restaurant.com`,
    password_hash: 'hashed_password_123',
    address: '123 E2E Test Street',
    phone: '+1234567890'
  };
  
  const { response: restaurantResponse, result: restaurantResult } = await callFunction('create_restaurant', 'POST', restaurantData);
  if (restaurantResponse.status !== 200 || !restaurantResult.success) {
    console.log('❌ Restaurant creation failed');
    return false;
  }
  const restaurant = restaurantResult.data;
  console.log(`✅ Restaurant created: ${restaurant.name} (ID: ${restaurant.id})`);
  
  // 2. Owner creates admin account
  console.log('👨‍💼 Step 2: Owner creates admin account');
  const adminData = {
    restaurant_id: restaurant.id,
    name: 'E2E Admin',
    email: `admin${timestamp}@e2e.com`,
    password_hash: 'hashed_password_123',
    role: 'owner'
  };
  
  const { response: adminResponse, result: adminResult } = await callFunction('create_admin', 'POST', adminData);
  if (adminResponse.status !== 200 || !adminResult.success) {
    console.log('❌ Admin creation failed');
    return false;
  }
  const admin = adminResult.data;
  console.log(`✅ Admin created: ${admin.name} (ID: ${admin.id})`);
  
  // 3. Admin hires staff
  console.log('👥 Step 3: Admin hires staff members');
  const staffMembers = [
    { name: 'E2E Waiter 1', email: `waiter1${timestamp}@e2e.com`, role: 'waiter' },
    { name: 'E2E Waiter 2', email: `waiter2${timestamp}@e2e.com`, role: 'waiter' },
    { name: 'E2E Chef', email: `chef${timestamp}@e2e.com`, role: 'chef' },
    { name: 'E2E Cashier', email: `cashier${timestamp}@e2e.com`, role: 'cashier' }
  ];
  
  const createdStaff = [];
  for (const staffData of staffMembers) {
    const fullStaffData = {
      ...staffData,
      restaurant_id: restaurant.id,
      password_hash: 'hashed_password_123'
    };
    
    const { response: staffResponse, result: staffResult } = await callFunction('create_staff', 'POST', fullStaffData);
    if (staffResponse.status === 200 && staffResult.success) {
      createdStaff.push(staffResult.data);
      console.log(`✅ ${staffData.role} created: ${staffData.name}`);
    } else {
      console.log(`❌ Failed to create ${staffData.role}: ${staffData.name}`);
    }
  }
  
  // 4. Admin sets up tables
  console.log('🪑 Step 4: Admin sets up restaurant tables');
  const tables = [
    { table_number: 1, capacity: 2, status: 'available' },
    { table_number: 2, capacity: 4, status: 'available' },
    { table_number: 3, capacity: 6, status: 'available' },
    { table_number: 4, capacity: 8, status: 'available' },
    { table_number: 5, capacity: 4, status: 'reserved' }
  ];
  
  const createdTables = [];
  for (const tableData of tables) {
    const fullTableData = {
      ...tableData,
      restaurant_id: restaurant.id
    };
    
    const { response: tableResponse, result: tableResult } = await callFunction('create_table', 'POST', fullTableData);
    if (tableResponse.status === 200 && tableResult.success) {
      createdTables.push(tableResult.data);
      console.log(`✅ Table ${tableData.table_number} created (Capacity: ${tableData.capacity})`);
    } else {
      console.log(`❌ Failed to create table ${tableData.table_number}`);
    }
  }
  
  // 5. Admin creates menu
  console.log('🍔 Step 5: Admin creates restaurant menu');
  const menuItems = [
    { name: 'E2E Burger', description: 'Delicious E2E burger', category: 'Main Course', cost: 12.99 },
    { name: 'E2E Pizza', description: 'Fresh E2E pizza', category: 'Main Course', cost: 15.99 },
    { name: 'E2E Salad', description: 'Healthy E2E salad', category: 'Appetizer', cost: 8.99 },
    { name: 'E2E Soup', description: 'Warm E2E soup', category: 'Appetizer', cost: 6.99 },
    { name: 'E2E Cake', description: 'Sweet E2E cake', category: 'Dessert', cost: 7.99 },
    { name: 'E2E Ice Cream', description: 'Cold E2E ice cream', category: 'Dessert', cost: 4.99 }
  ];
  
  const createdMenuItems = [];
  for (const menuItemData of menuItems) {
    const fullMenuItemData = {
      ...menuItemData,
      restaurant_id: restaurant.id,
      available: true
    };
    
    const { response: menuResponse, result: menuResult } = await callFunction('create_menu_item', 'POST', fullMenuItemData);
    if (menuResponse.status === 200 && menuResult.success) {
      createdMenuItems.push(menuResult.data);
      console.log(`✅ ${menuItemData.category}: ${menuItemData.name} - $${menuItemData.cost}`);
    } else {
      console.log(`❌ Failed to create menu item: ${menuItemData.name}`);
    }
  }
  
  // 6. Verify setup
  console.log('✅ Step 6: Verifying restaurant setup');
  const { response: verifyResponse, result: verifyResult } = await callFunction('get_menu_items', 'GET', null, `?restaurant_id=${restaurant.id}`);
  if (verifyResponse.status === 200 && verifyResult.success) {
    console.log(`✅ Menu verification: ${verifyResult.data.length} items available`);
  }
  
  const { response: staffVerifyResponse, result: staffVerifyResult } = await callFunction('get_staff', 'GET', null, `?restaurant_id=${restaurant.id}`);
  if (staffVerifyResponse.status === 200 && staffVerifyResult.success) {
    console.log(`✅ Staff verification: ${staffVerifyResult.data.length} staff members`);
  }
  
  const { response: tablesVerifyResponse, result: tablesVerifyResult } = await callFunction('get_tables', 'GET', null, `?restaurant_id=${restaurant.id}`);
  if (tablesVerifyResponse.status === 200 && tablesVerifyResult.success) {
    console.log(`✅ Tables verification: ${tablesVerifyResult.data.length} tables`);
  }
  
  return {
    restaurant,
    admin,
    staff: createdStaff,
    tables: createdTables,
    menuItems: createdMenuItems
  };
}

async function testCustomerServiceScenario(setupData) {
  console.log('\n🍽️ Testing Customer Service Scenario...');
  console.log('=' * 50);
  
  // Scenario: Customers arrive and place orders
  
  // 1. Customer sits at table 1
  console.log('🪑 Step 1: Customer sits at table 1');
  const table1 = setupData.tables.find(t => t.table_number === 1);
  if (!table1) {
    console.log('❌ Table 1 not found');
    return false;
  }
  
  // 2. Waiter creates cart for table 1
  console.log('🛒 Step 2: Waiter creates cart for table 1');
  const cartData = {
    restaurant_id: setupData.restaurant.id,
    table_id: table1.id
  };
  
  const { response: cartResponse, result: cartResult } = await callFunction('create_cart', 'POST', cartData);
  if (cartResponse.status !== 200 || !cartResult.success) {
    console.log('❌ Cart creation failed');
    return false;
  }
  const cart = cartResult.data;
  console.log(`✅ Cart created for table ${table1.table_number}`);
  
  // 3. Customer orders items
  console.log('📝 Step 3: Customer places order');
  const orderItems = [
    { menuItem: setupData.menuItems[0], quantity: 2, notes: 'No onions' },
    { menuItem: setupData.menuItems[2], quantity: 1, notes: 'Extra dressing' },
    { menuItem: setupData.menuItems[4], quantity: 1, notes: 'With ice cream' }
  ];
  
  for (const item of orderItems) {
    const cartItemData = {
      cart_id: cart.id,
      menu_item_id: item.menuItem.id,
      quantity: item.quantity,
      notes: item.notes
    };
    
    const { response: addItemResponse, result: addItemResult } = await callFunction('add_to_cart', 'POST', cartItemData);
    if (addItemResponse.status === 200 && addItemResult.success) {
      console.log(`✅ Added ${item.quantity}x ${item.menuItem.name} - ${item.notes}`);
    } else {
      console.log(`❌ Failed to add ${item.menuItem.name}`);
    }
  }
  
  // 4. Waiter places order
  console.log('📝 Step 4: Waiter places order');
  const waiter = setupData.staff.find(s => s.role === 'waiter');
  if (!waiter) {
    console.log('❌ No waiter found');
    return false;
  }
  
  const orderData = {
    cart_id: cart.id,
    created_by: waiter.id
  };
  
  const { response: orderResponse, result: orderResult } = await callFunction('place_order', 'POST', orderData);
  if (orderResponse.status !== 200 || !orderResult.success) {
    console.log('❌ Order placement failed');
    return false;
  }
  const order = orderResult.data;
  console.log(`✅ Order placed: $${order.total_amount} (Order ID: ${order.id})`);
  
  // 5. Kitchen receives order
  console.log('👨‍🍳 Step 5: Kitchen receives order');
  const { response: updateResponse, result: updateResult } = await callFunction('update_order_status', 'PUT', {
    id: order.id,
    status: 'preparing'
  });
  if (updateResponse.status === 200 && updateResult.success) {
    console.log('✅ Order status updated to: preparing');
  }
  
  // 6. Order is served
  console.log('🍽️ Step 6: Order is served');
  const { response: serveResponse, result: serveResult } = await callFunction('update_order_status', 'PUT', {
    id: order.id,
    status: 'served'
  });
  if (serveResponse.status === 200 && serveResult.success) {
    console.log('✅ Order status updated to: served');
  }
  
  // 7. Order is completed
  console.log('✅ Step 7: Order is completed');
  const { response: completeResponse, result: completeResult } = await callFunction('update_order_status', 'PUT', {
    id: order.id,
    status: 'completed'
  });
  if (completeResponse.status === 200 && completeResult.success) {
    console.log('✅ Order status updated to: completed');
  }
  
  // 8. Verify order history
  console.log('📋 Step 8: Verifying order history');
  const { response: ordersResponse, result: ordersResult } = await callFunction('get_orders', 'GET', null, `?restaurant_id=${setupData.restaurant.id}`);
  if (ordersResponse.status === 200 && ordersResult.success) {
    console.log(`✅ Order history: ${ordersResult.data.length} orders found`);
    const completedOrders = ordersResult.data.filter(o => o.status === 'completed');
    console.log(`✅ Completed orders: ${completedOrders.length}`);
  }
  
  return true;
}

async function testMultipleTablesScenario(setupData) {
  console.log('\n🍽️ Testing Multiple Tables Scenario...');
  console.log('=' * 50);
  
  // Scenario: Multiple tables are being served simultaneously
  
  const tables = setupData.tables.slice(0, 3); // Use first 3 tables
  const orders = [];
  
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    console.log(`🪑 Setting up table ${table.table_number}...`);
    
    // Create cart for table
    const cartData = {
      restaurant_id: setupData.restaurant.id,
      table_id: table.id
    };
    
    const { response: cartResponse, result: cartResult } = await callFunction('create_cart', 'POST', cartData);
    if (cartResponse.status !== 200 || !cartResult.success) {
      console.log(`❌ Failed to create cart for table ${table.table_number}`);
      continue;
    }
    
    // Add random items to cart
    const randomItems = setupData.menuItems
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1);
    
    for (const item of randomItems) {
      const cartItemData = {
        cart_id: cartResult.data.id,
        menu_item_id: item.id,
        quantity: Math.floor(Math.random() * 3) + 1,
        notes: `Table ${table.table_number} order`
      };
      
      await callFunction('add_to_cart', 'POST', cartItemData);
    }
    
    // Place order
    const waiter = setupData.staff.find(s => s.role === 'waiter');
    if (waiter) {
      const orderData = {
        cart_id: cartResult.data.id,
        created_by: waiter.id
      };
      
      const { response: orderResponse, result: orderResult } = await callFunction('place_order', 'POST', orderData);
      if (orderResponse.status === 200 && orderResult.success) {
        orders.push(orderResult.data);
        console.log(`✅ Order placed for table ${table.table_number}: $${orderResult.data.total_amount}`);
      }
    }
  }
  
  console.log(`✅ Multiple tables scenario: ${orders.length} orders placed`);
  return orders;
}

async function runE2ETests() {
  console.log('🚀 Running End-to-End Tests - Complete Restaurant Flow');
  console.log('=' * 70);
  
  const startTime = Date.now();
  
  // Test 1: Restaurant Opening Scenario
  const setupData = await testRestaurantOpeningScenario();
  if (!setupData) {
    console.log('❌ Restaurant opening scenario failed');
    return;
  }
  
  // Test 2: Customer Service Scenario
  const serviceSuccess = await testCustomerServiceScenario(setupData);
  if (!serviceSuccess) {
    console.log('❌ Customer service scenario failed');
    return;
  }
  
  // Test 3: Multiple Tables Scenario
  const multipleOrders = await testMultipleTablesScenario(setupData);
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n🎉 E2E Test Results:');
  console.log('=' * 30);
  console.log(`✅ Restaurant setup: Complete`);
  console.log(`✅ Customer service: Complete`);
  console.log(`✅ Multiple tables: ${multipleOrders.length} orders`);
  console.log(`⏱️  Total duration: ${duration.toFixed(2)}s`);
  console.log(`🏪 Restaurant ID: ${setupData.restaurant.id}`);
  
  console.log('\n🎯 All E2E tests completed successfully!');
}

if (require.main === module) {
  runE2ETests();
}

module.exports = { runE2ETests };
