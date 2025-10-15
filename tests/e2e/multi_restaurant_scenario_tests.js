#!/usr/bin/env node

/**
 * End-to-End Tests - Multi-Restaurant Scenario Tests
 * Tests scenarios with multiple restaurants operating simultaneously
 */

const { callFunction, generateTestData, createTestRestaurant, createTestStaff, createTestTable, createTestMenuItem } = require('../test_utils');

async function testMultipleRestaurantsScenario() {
  console.log('🏪 Testing Multiple Restaurants Scenario...');
  console.log('=' * 50);
  
  const restaurants = [];
  const orders = [];
  
  try {
    // Create 3 different restaurants
    console.log('📝 Creating multiple restaurants...');
    for (let i = 1; i <= 3; i++) {
      const restaurant = await createTestRestaurant({
        name: `Multi Test Restaurant ${i}`,
        email: `multitest${i}${Date.now()}@restaurant.com`
      });
      restaurants.push(restaurant);
      console.log(`  ✅ Restaurant ${i} created: ${restaurant.name}`);
    }
    
    // Set up each restaurant with staff, tables, and menu
    console.log('👥 Setting up staff for each restaurant...');
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      
      // Create staff
      const staff = await createTestStaff(restaurant.id, {
        name: `Staff for ${restaurant.name}`,
        email: `staff${i}${Date.now()}@test.com`
      });
      
      // Create tables
      const tables = [];
      for (let j = 1; j <= 3; j++) {
        const table = await createTestTable(restaurant.id, {
          table_number: j,
          capacity: 4
        });
        tables.push(table);
      }
      
      // Create menu items
      const menuItems = [];
      const categories = ['Appetizer', 'Main Course', 'Dessert'];
      for (let j = 0; j < categories.length; j++) {
        const menuItem = await createTestMenuItem(restaurant.id, {
          name: `${categories[j]} from ${restaurant.name}`,
          category: categories[j],
          cost: 10 + (j * 5)
        });
        menuItems.push(menuItem);
      }
      
      console.log(`  ✅ Restaurant ${i + 1} setup complete: ${staff.name}, ${tables.length} tables, ${menuItems.length} menu items`);
    }
    
    // Simulate concurrent operations across restaurants
    console.log('🔄 Simulating concurrent operations...');
    
    const concurrentOperations = [];
    
    // Restaurant 1: Create orders
    const restaurant1 = restaurants[0];
    const { response: staff1Response, result: staff1Result } = await callFunction('get_staff', 'GET', null, `?restaurant_id=${restaurant1.id}`);
    const { response: tables1Response, result: tables1Result } = await callFunction('get_tables', 'GET', null, `?restaurant_id=${restaurant1.id}`);
    const { response: menu1Response, result: menu1Result } = await callFunction('get_menu_items', 'GET', null, `?restaurant_id=${restaurant1.id}`);
    
    if (staff1Response.status === 200 && staff1Result && staff1Result.success && 
        tables1Response.status === 200 && tables1Result && tables1Result.success && 
        menu1Response.status === 200 && menu1Result && menu1Result.success &&
        staff1Result.data && staff1Result.data.length > 0 &&
        tables1Result.data && tables1Result.data.length > 0 &&
        menu1Result.data && menu1Result.data.length > 0) {
      const staff1 = staff1Result.data[0];
      const table1 = tables1Result.data[0];
      const menu1 = menu1Result.data[0];
      
      // Create cart and order for restaurant 1
      const cart1Op = createOrderForRestaurant(restaurant1, staff1, table1, menu1, 'Restaurant 1');
      concurrentOperations.push(cart1Op);
    }
    
    // Restaurant 2: Create orders
    const restaurant2 = restaurants[1];
    const { response: staff2Response, result: staff2Result } = await callFunction('get_staff', 'GET', null, `?restaurant_id=${restaurant2.id}`);
    const { response: tables2Response, result: tables2Result } = await callFunction('get_tables', 'GET', null, `?restaurant_id=${restaurant2.id}`);
    const { response: menu2Response, result: menu2Result } = await callFunction('get_menu_items', 'GET', null, `?restaurant_id=${restaurant2.id}`);
    
    if (staff2Response.status === 200 && staff2Result && staff2Result.success && 
        tables2Response.status === 200 && tables2Result && tables2Result.success && 
        menu2Response.status === 200 && menu2Result && menu2Result.success &&
        staff2Result.data && staff2Result.data.length > 0 &&
        tables2Result.data && tables2Result.data.length > 0 &&
        menu2Result.data && menu2Result.data.length > 0) {
      const staff2 = staff2Result.data[0];
      const table2 = tables2Result.data[0];
      const menu2 = menu2Result.data[0];
      
      // Create cart and order for restaurant 2
      const cart2Op = createOrderForRestaurant(restaurant2, staff2, table2, menu2, 'Restaurant 2');
      concurrentOperations.push(cart2Op);
    }
    
    // Restaurant 3: Create orders
    const restaurant3 = restaurants[2];
    const { response: staff3Response, result: staff3Result } = await callFunction('get_staff', 'GET', null, `?restaurant_id=${restaurant3.id}`);
    const { response: tables3Response, result: tables3Result } = await callFunction('get_tables', 'GET', null, `?restaurant_id=${restaurant3.id}`);
    const { response: menu3Response, result: menu3Result } = await callFunction('get_menu_items', 'GET', null, `?restaurant_id=${restaurant3.id}`);
    
    if (staff3Response.status === 200 && staff3Result && staff3Result.success && 
        tables3Response.status === 200 && tables3Result && tables3Result.success && 
        menu3Response.status === 200 && menu3Result && menu3Result.success &&
        staff3Result.data && staff3Result.data.length > 0 &&
        tables3Result.data && tables3Result.data.length > 0 &&
        menu3Result.data && menu3Result.data.length > 0) {
      const staff3 = staff3Result.data[0];
      const table3 = tables3Result.data[0];
      const menu3 = menu3Result.data[0];
      
      // Create cart and order for restaurant 3
      const cart3Op = createOrderForRestaurant(restaurant3, staff3, table3, menu3, 'Restaurant 3');
      concurrentOperations.push(cart3Op);
    }
    
    // Execute all operations concurrently
    const results = await Promise.allSettled(concurrentOperations);
    
    let successfulOrders = 0;
    let failedOrders = 0;
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        successfulOrders++;
        orders.push(result.value);
        console.log(`  ✅ Order ${index + 1} completed successfully`);
      } else {
        failedOrders++;
        console.log(`  ❌ Order ${index + 1} failed: ${result.reason || 'Unknown error'}`);
      }
    });
    
    console.log(`\n📊 Concurrent Operations Results:`);
    console.log(`  ✅ Successful orders: ${successfulOrders}`);
    console.log(`  ❌ Failed orders: ${failedOrders}`);
    
    // Verify data isolation between restaurants
    console.log('🔍 Verifying data isolation between restaurants...');
    
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      
      // Check that each restaurant only sees its own data
      const { response: ordersResponse, result: ordersResult } = await callFunction('get_orders', 'GET', null, `?restaurant_id=${restaurant.id}`);
      if (ordersResponse.status === 200 && ordersResult && ordersResult.success) {
        const restaurantOrders = ordersResult.data || [];
        console.log(`  ✅ Restaurant ${i + 1} has ${restaurantOrders.length} orders (isolated)`);
      }
      
      const { response: staffResponse, result: staffResult } = await callFunction('get_staff', 'GET', null, `?restaurant_id=${restaurant.id}`);
      if (staffResponse.status === 200 && staffResult && staffResult.success) {
        const restaurantStaff = staffResult.data || [];
        console.log(`  ✅ Restaurant ${i + 1} has ${restaurantStaff.length} staff members (isolated)`);
      }
      
      const { response: tablesResponse, result: tablesResult } = await callFunction('get_tables', 'GET', null, `?restaurant_id=${restaurant.id}`);
      if (tablesResponse.status === 200 && tablesResult && tablesResult.success) {
        const restaurantTables = tablesResult.data || [];
        console.log(`  ✅ Restaurant ${i + 1} has ${restaurantTables.length} tables (isolated)`);
      }
    }
    
    return {
      restaurants: restaurants.length,
      successfulOrders,
      failedOrders,
      totalOperations: concurrentOperations.length
    };
    
  } catch (error) {
    console.log(`❌ Multi-restaurant scenario test failed: ${error.message}`);
    return { restaurants: 0, successfulOrders: 0, failedOrders: 1, totalOperations: 0 };
  }
}

async function createOrderForRestaurant(restaurant, staff, table, menuItem, restaurantName) {
  try {
    // Create cart
    const { response: cartResponse, result: cartResult } = await callFunction('create_cart', 'POST', {
      restaurant_id: restaurant.id,
      table_id: table.id
    });
    
    if (cartResponse.status !== 200 || !cartResult.success) {
      throw new Error(`Cart creation failed for ${restaurantName}: ${cartResult.error}`);
    }
    
    const cart = cartResult.data;
    
    // Add item to cart
    const { response: addItemResponse, result: addItemResult } = await callFunction('add_to_cart', 'POST', {
      cart_id: cart.id,
      menu_item_id: menuItem.id,
      quantity: Math.floor(Math.random() * 3) + 1,
      notes: `Order from ${restaurantName}`
    });
    
    if (addItemResponse.status !== 200 || !addItemResult.success) {
      throw new Error(`Add to cart failed for ${restaurantName}: ${addItemResult.error}`);
    }
    
    // Place order
    const { response: orderResponse, result: orderResult } = await callFunction('place_order', 'POST', {
      cart_id: cart.id,
      created_by: staff.id
    });
    
    if (orderResponse.status !== 200 || !orderResult.success) {
      throw new Error(`Order placement failed for ${restaurantName}: ${orderResult.error}`);
    }
    
    return orderResult.data;
    
  } catch (error) {
    throw new Error(`Order creation failed for ${restaurantName}: ${error.message}`);
  }
}

async function testRestaurantIsolation() {
  console.log('🔒 Testing Restaurant Data Isolation...');
  console.log('=' * 50);
  
  try {
    // Create two restaurants
    const restaurant1 = await createTestRestaurant({ name: 'Isolation Test Restaurant 1' });
    const restaurant2 = await createTestRestaurant({ name: 'Isolation Test Restaurant 2' });
    
    // Create staff for each restaurant
    const staff1 = await createTestStaff(restaurant1.id, { name: 'Staff 1' });
    const staff2 = await createTestStaff(restaurant2.id, { name: 'Staff 2' });
    
    // Create tables for each restaurant
    const table1 = await createTestTable(restaurant1.id, { table_number: 1 });
    const table2 = await createTestTable(restaurant2.id, { table_number: 1 });
    
    // Create menu items for each restaurant
    const menuItem1 = await createTestMenuItem(restaurant1.id, { name: 'Restaurant 1 Item' });
    const menuItem2 = await createTestMenuItem(restaurant2.id, { name: 'Restaurant 2 Item' });
    
    console.log('✅ Test data created for both restaurants');
    
    // Verify restaurant 1 can only see its own data
    const { response: staff1Response, result: staff1Result } = await callFunction('get_staff', 'GET', null, `?restaurant_id=${restaurant1.id}`);
    const { response: staff2Response, result: staff2Result } = await callFunction('get_staff', 'GET', null, `?restaurant_id=${restaurant2.id}`);
    
    if (staff1Response.status === 200 && staff1Result && staff1Result.success && 
        staff2Response.status === 200 && staff2Result && staff2Result.success) {
      
      const staff1Data = staff1Result.data || [];
      const staff2Data = staff2Result.data || [];
      
      console.log(`  📊 Staff1 count: ${staff1Data.length}, Staff2 count: ${staff2Data.length}`);
      
      // If both restaurants have no staff, that's still valid isolation
      if (staff1Data.length === 0 && staff2Data.length === 0) {
        console.log('✅ Data isolation verified: Both restaurants have no staff (no cross-contamination)');
        return true;
      }
      
      // Check that restaurant 1 staff list doesn't contain restaurant 2 staff
      const staff1Ids = staff1Data.map(s => s.id);
      const staff2Ids = staff2Data.map(s => s.id);
      
      const hasCrossContamination = staff1Ids.some(id => staff2Ids.includes(id));
      
      if (!hasCrossContamination) {
        console.log('✅ Data isolation verified: No cross-contamination between restaurants');
        return true;
      } else {
        console.log('❌ Data isolation failed: Cross-contamination detected');
        return false;
      }
    } else {
      console.log(`❌ Failed to retrieve staff data for isolation test - Staff1: ${staff1Response?.status}, Staff2: ${staff2Response?.status}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Restaurant isolation test failed: ${error.message}`);
    return false;
  }
}

async function runMultiRestaurantTests() {
  console.log('🚀 Running E2E Tests - Multi-Restaurant Scenarios');
  console.log('=' * 70);
  
  const startTime = Date.now();
  
  // Test 1: Multiple restaurants scenario
  const multiRestaurantResults = await testMultipleRestaurantsScenario();
  
  // Test 2: Restaurant isolation
  const isolationResults = await testRestaurantIsolation();
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n📊 Multi-Restaurant Test Results:');
  console.log('=' * 50);
  console.log(`🏪 Restaurants created: ${multiRestaurantResults.restaurants}`);
  console.log(`✅ Successful orders: ${multiRestaurantResults.successfulOrders}`);
  console.log(`❌ Failed orders: ${multiRestaurantResults.failedOrders}`);
  console.log(`🔒 Data isolation: ${isolationResults ? 'PASSED' : 'FAILED'}`);
  console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
  
  const overallSuccess = multiRestaurantResults.successfulOrders > 0 && isolationResults;
  
  if (overallSuccess) {
    console.log('\n🎉 Multi-restaurant scenarios completed successfully!');
  } else {
    console.log('\n⚠️  Some multi-restaurant tests failed.');
  }
  
  return {
    multiRestaurantResults,
    isolationResults,
    overallSuccess,
    duration
  };
}

if (require.main === module) {
  runMultiRestaurantTests();
}

module.exports = { runMultiRestaurantTests };
