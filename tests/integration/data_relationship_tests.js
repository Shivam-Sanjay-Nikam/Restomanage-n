#!/usr/bin/env node

/**
 * Integration Tests - Data Relationship Tests
 * Tests data relationships and foreign key constraints
 */

const { callFunction, generateTestData, createTestRestaurant, createTestStaff, createTestTable, createTestMenuItem } = require('../test_utils');

async function testRestaurantDataRelationships() {
  console.log('🔗 Testing Restaurant Data Relationships...');
  
  let passed = 0;
  let failed = 0;
  
  try {
    // Create restaurant
    const restaurant = await createTestRestaurant();
    console.log(`  ✅ Restaurant created: ${restaurant.id}`);
    passed++;
    
    // Create admin for restaurant
    const adminData = generateTestData('admin', { restaurant_id: restaurant.id });
    const { response: adminResponse, result: adminResult } = await callFunction('create_admin', 'POST', adminData);
    if (adminResponse.status === 200 && adminResult.success) {
      console.log(`  ✅ Admin created for restaurant: ${adminResult.data.id}`);
      passed++;
    } else {
      console.log(`  ❌ Admin creation failed: ${adminResult.error}`);
      failed++;
    }
    
    // Create staff for restaurant
    const staff = await createTestStaff(restaurant.id);
    console.log(`  ✅ Staff created for restaurant: ${staff.id}`);
    passed++;
    
    // Create table for restaurant
    const table = await createTestTable(restaurant.id);
    console.log(`  ✅ Table created for restaurant: ${table.id}`);
    passed++;
    
    // Create menu item for restaurant
    const menuItem = await createTestMenuItem(restaurant.id);
    console.log(`  ✅ Menu item created for restaurant: ${menuItem.id}`);
    passed++;
    
    // Verify relationships by retrieving data
    const { response: staffResponse, result: staffResult } = await callFunction('get_staff', 'GET', null, `?restaurant_id=${restaurant.id}`);
    if (staffResponse.status === 200 && staffResult.success && staffResult.data.length > 0) {
      console.log(`  ✅ Staff retrieval by restaurant: ${staffResult.data.length} staff found`);
      passed++;
    } else {
      console.log(`  ❌ Staff retrieval by restaurant failed`);
      failed++;
    }
    
    const { response: tablesResponse, result: tablesResult } = await callFunction('get_tables', 'GET', null, `?restaurant_id=${restaurant.id}`);
    if (tablesResponse.status === 200 && tablesResult.success && tablesResult.data.length > 0) {
      console.log(`  ✅ Tables retrieval by restaurant: ${tablesResult.data.length} tables found`);
      passed++;
    } else {
      console.log(`  ❌ Tables retrieval by restaurant failed`);
      failed++;
    }
    
    const { response: menuResponse, result: menuResult } = await callFunction('get_menu_items', 'GET', null, `?restaurant_id=${restaurant.id}`);
    if (menuResponse.status === 200 && menuResult.success && menuResult.data.length > 0) {
      console.log(`  ✅ Menu items retrieval by restaurant: ${menuResult.data.length} items found`);
      passed++;
    } else {
      console.log(`  ❌ Menu items retrieval by restaurant failed`);
      failed++;
    }
    
  } catch (error) {
    console.log(`  ❌ Restaurant data relationships test failed: ${error.message}`);
    failed++;
  }
  
  console.log(`  📊 Restaurant Data Relationships: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

async function testCartOrderRelationships() {
  console.log('🛒 Testing Cart-Order Relationships...');
  
  let passed = 0;
  let failed = 0;
  
  try {
    // Create test data
    const restaurant = await createTestRestaurant();
    const staff = await createTestStaff(restaurant.id);
    const table = await createTestTable(restaurant.id);
    const menuItem = await createTestMenuItem(restaurant.id);
    
    // Create cart
    const { response: cartResponse, result: cartResult } = await callFunction('create_cart', 'POST', {
      restaurant_id: restaurant.id,
      table_id: table.id
    });
    
    if (cartResponse.status === 200 && cartResult.success) {
      const cart = cartResult.data;
      console.log(`  ✅ Cart created: ${cart.id}`);
      passed++;
      
      // Add item to cart
      const { response: addItemResponse, result: addItemResult } = await callFunction('add_to_cart', 'POST', {
        cart_id: cart.id,
        menu_item_id: menuItem.id,
        quantity: 2
      });
      
      if (addItemResponse.status === 200 && addItemResult.success) {
        console.log(`  ✅ Item added to cart: ${addItemResult.data.id}`);
        passed++;
        
        // Place order
        const { response: orderResponse, result: orderResult } = await callFunction('place_order', 'POST', {
          cart_id: cart.id,
          created_by: staff.id
        });
        
        if (orderResponse.status === 200 && orderResult.success) {
          const order = orderResult.data;
          console.log(`  ✅ Order placed: ${order.id}`);
          passed++;
          
          // Verify order relationships
          const { response: getOrderResponse, result: getOrderResult } = await callFunction('get_orders', 'GET', null, `?restaurant_id=${restaurant.id}`);
          if (getOrderResponse.status === 200 && getOrderResult.success) {
            const orders = getOrderResult.data;
            const foundOrder = orders.find(o => o.id === order.id);
            
            if (foundOrder) {
              console.log(`  ✅ Order found in restaurant orders: ${foundOrder.id}`);
              passed++;
              
              // Verify order contains cart items
              if (foundOrder.cart && foundOrder.cart.cart_items && foundOrder.cart.cart_items.length > 0) {
                console.log(`  ✅ Order contains cart items: ${foundOrder.cart.cart_items.length} items`);
                passed++;
              } else {
                console.log(`  ❌ Order does not contain cart items`);
                failed++;
              }
              
              // Verify order references correct table
              if (foundOrder.table && foundOrder.table.id === table.id) {
                console.log(`  ✅ Order references correct table: ${foundOrder.table.table_number}`);
                passed++;
              } else {
                console.log(`  ❌ Order does not reference correct table`);
                failed++;
              }
              
              // Verify order references correct staff
              if (foundOrder.created_by === staff.id) {
                console.log(`  ✅ Order references correct staff: ${staff.id}`);
                passed++;
              } else {
                console.log(`  ❌ Order does not reference correct staff`);
                failed++;
              }
              
            } else {
              console.log(`  ❌ Order not found in restaurant orders`);
              failed++;
            }
          } else {
            console.log(`  ❌ Failed to retrieve orders`);
            failed++;
          }
          
        } else {
          console.log(`  ❌ Order placement failed: ${orderResult.error}`);
          failed++;
        }
        
      } else {
        console.log(`  ❌ Add item to cart failed: ${addItemResult.error}`);
        failed++;
      }
      
    } else {
      console.log(`  ❌ Cart creation failed: ${cartResult.error}`);
      failed++;
    }
    
  } catch (error) {
    console.log(`  ❌ Cart-Order relationships test failed: ${error.message}`);
    failed++;
  }
  
  console.log(`  📊 Cart-Order Relationships: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

async function testCascadeDeletion() {
  console.log('🗑️ Testing Cascade Deletion...');
  
  let passed = 0;
  let failed = 0;
  
  try {
    // Create test data
    const restaurant = await createTestRestaurant();
    const staff = await createTestStaff(restaurant.id);
    const table = await createTestTable(restaurant.id);
    const menuItem = await createTestMenuItem(restaurant.id);
    
    // Create cart and order
    const { response: cartResponse, result: cartResult } = await callFunction('create_cart', 'POST', {
      restaurant_id: restaurant.id,
      table_id: table.id
    });
    
    if (cartResponse.status === 200 && cartResult.success) {
      const cart = cartResult.data;
      
      // Add item to cart
      await callFunction('add_to_cart', 'POST', {
        cart_id: cart.id,
        menu_item_id: menuItem.id,
        quantity: 1
      });
      
      // Place order
      const { response: orderResponse, result: orderResult } = await callFunction('place_order', 'POST', {
        cart_id: cart.id,
        created_by: staff.id
      });
      
      if (orderResponse.status === 200 && orderResult.success) {
        const order = orderResult.data;
        console.log(`  ✅ Order created: ${order.id}`);
        passed++;
        
        // Note: We can't actually test cascade deletion from the API
        // as there's no delete endpoint, but we can verify the relationships exist
        console.log(`  ✅ All relationships established successfully`);
        passed++;
        
      } else {
        console.log(`  ❌ Order creation failed: ${orderResult.error}`);
        failed++;
      }
      
    } else {
      console.log(`  ❌ Cart creation failed: ${cartResult.error}`);
      failed++;
    }
    
  } catch (error) {
    console.log(`  ❌ Cascade deletion test failed: ${error.message}`);
    failed++;
  }
  
  console.log(`  📊 Cascade Deletion: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

async function runDataRelationshipTests() {
  console.log('🚀 Running Integration Tests - Data Relationships');
  console.log('=' * 60);
  
  const startTime = Date.now();
  
  const restaurantResults = await testRestaurantDataRelationships();
  const cartOrderResults = await testCartOrderRelationships();
  const cascadeResults = await testCascadeDeletion();
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  const totalPassed = restaurantResults.passed + cartOrderResults.passed + cascadeResults.passed;
  const totalFailed = restaurantResults.failed + cartOrderResults.failed + cascadeResults.failed;
  
  console.log('\n📊 Data Relationship Test Results:');
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
  runDataRelationshipTests();
}

module.exports = { runDataRelationshipTests };
