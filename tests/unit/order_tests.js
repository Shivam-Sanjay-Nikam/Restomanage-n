/**
 * Order Management Tests
 * Tests place_order, get_orders, update_order_status functions
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

async function testPlaceOrder(cartId, staffId) {
  console.log('📝 Testing place_order...');
  
  const orderData = {
    cart_id: cartId,
    created_by: staffId
  };

  const { response, result, error } = await callFunction('place_order', 'POST', orderData);
  
  if (error) {
    console.log('❌ Network error:', error);
    return null;
  }
  
  if (response.status === 200 && result.success) {
    console.log('✅ Order placed successfully');
    console.log('   Order ID:', result.data.id);
    console.log('   Total Amount:', result.data.total_amount);
    console.log('   Status:', result.data.status);
    console.log('   Created By:', result.data.created_by);
    return result.data;
  } else {
    console.log('❌ Failed:', result.error);
    return null;
  }
}

async function testGetOrders(restaurantId) {
  console.log('📋 Testing get_orders...');
  
  const { response, result, error } = await callFunction('get_orders', 'GET', null, `?restaurant_id=${restaurantId}`);
  
  if (error) {
    console.log('❌ Network error:', error);
    return null;
  }
  
  if (response.status === 200 && result.success) {
    console.log('✅ Orders retrieved successfully');
    console.log('   Count:', result.data.length);
    result.data.forEach((order, index) => {
      console.log(`   ${index + 1}. Order ${order.id} - $${order.total_amount} (${order.status})`);
    });
    return result.data;
  } else {
    console.log('❌ Failed:', result.error);
    return null;
  }
}

async function testGetOrdersByTable(restaurantId, tableId) {
  console.log('📋 Testing get_orders by table...');
  
  const { response, result, error } = await callFunction('get_orders', 'GET', null, `?restaurant_id=${restaurantId}&table_id=${tableId}`);
  
  if (error) {
    console.log('❌ Network error:', error);
    return null;
  }
  
  if (response.status === 200 && result.success) {
    console.log('✅ Orders by table retrieved successfully');
    console.log('   Count:', result.data.length);
    result.data.forEach((order, index) => {
      console.log(`   ${index + 1}. Order ${order.id} - Table ${order.table.table_number} - $${order.total_amount}`);
    });
    return result.data;
  } else {
    console.log('❌ Failed:', result.error);
    return null;
  }
}

async function testGetOrdersByStatus(restaurantId, status) {
  console.log(`📋 Testing get_orders by status (${status})...`);
  
  const { response, result, error } = await callFunction('get_orders', 'GET', null, `?restaurant_id=${restaurantId}&status=${status}`);
  
  if (error) {
    console.log('❌ Network error:', error);
    return null;
  }
  
  if (response.status === 200 && result.success) {
    console.log(`✅ Orders with status '${status}' retrieved successfully`);
    console.log('   Count:', result.data.length);
    result.data.forEach((order, index) => {
      console.log(`   ${index + 1}. Order ${order.id} - ${order.status} - $${order.total_amount}`);
    });
    return result.data;
  } else {
    console.log('❌ Failed:', result.error);
    return null;
  }
}

async function testUpdateOrderStatus(orderId, newStatus) {
  console.log(`✏️ Testing update_order_status to '${newStatus}'...`);
  
  const updateData = {
    id: orderId,
    status: newStatus
  };

  const { response, result, error } = await callFunction('update_order_status', 'PUT', updateData);
  
  if (error) {
    console.log('❌ Network error:', error);
    return null;
  }
  
  if (response.status === 200 && result.success) {
    console.log('✅ Order status updated successfully');
    console.log('   New status:', result.data.status);
    return result.data;
  } else {
    console.log('❌ Failed:', result.error);
    return null;
  }
}

async function testOrderStatusFlow(orderId) {
  console.log('🔄 Testing complete order status flow...');
  
  const statuses = ['preparing', 'served', 'completed'];
  
  for (const status of statuses) {
    const result = await testUpdateOrderStatus(orderId, status);
    if (!result) {
      console.log(`❌ Failed to update status to ${status}`);
      return false;
    }
    // Small delay between updates
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('✅ Complete order status flow tested successfully');
  return true;
}

async function testPlaceOrderValidation() {
  console.log('🧪 Testing place_order validation...');
  
  const invalidData = {
    cart_id: 'invalid-cart-id',
    created_by: 'invalid-staff-id'
  };

  const { response, result, error } = await callFunction('place_order', 'POST', invalidData);
  
  if (error) {
    console.log('❌ Network error:', error);
    return false;
  }
  
  if (response.status === 400 && !result.success) {
    console.log('✅ Validation working correctly');
    console.log('   Error:', result.error);
    return true;
  } else {
    console.log('❌ Validation should have failed');
    return false;
  }
}

async function testUpdateOrderStatusValidation() {
  console.log('🧪 Testing update_order_status validation...');
  
  const invalidData = {
    id: 'invalid-order-id',
    status: 'invalid-status'
  };

  const { response, result, error } = await callFunction('update_order_status', 'PUT', invalidData);
  
  if (error) {
    console.log('❌ Network error:', error);
    return false;
  }
  
  if (response.status === 400 && !result.success) {
    console.log('✅ Validation working correctly');
    console.log('   Error:', result.error);
    return true;
  } else {
    console.log('❌ Validation should have failed');
    return false;
  }
}

// Run tests
async function runOrderTests(restaurantId, tableId, cartId, staffId) {
  console.log('🚀 Running Order Tests');
  console.log('=' * 40);
  
  if (!restaurantId || !tableId || !cartId || !staffId) {
    console.log('⚠️  Restaurant ID, Table ID, Cart ID, and Staff ID required for order tests');
    return null;
  }
  
  const order = await testPlaceOrder(cartId, staffId);
  if (!order) return null;
  
  await testGetOrders(restaurantId);
  await testGetOrdersByTable(restaurantId, tableId);
  await testGetOrdersByStatus(restaurantId, 'placed');
  await testOrderStatusFlow(order.id);
  await testPlaceOrderValidation();
  await testUpdateOrderStatusValidation();
  
  console.log('\n✅ Order tests completed!');
  return order;
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runOrderTests, callFunction };
} else {
  // Run if called directly
  console.log('Please provide restaurant ID, table ID, cart ID, and staff ID to run order tests');
}
