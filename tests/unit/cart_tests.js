/**
 * Cart Management Tests
 * Tests create_cart, add_to_cart, remove_from_cart, get_cart functions
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

async function testCreateCart(restaurantId, tableId) {
  console.log('🛒 Testing create_cart...');
  
  const cartData = {
    restaurant_id: restaurantId,
    table_id: tableId
  };

  const { response, result, error } = await callFunction('create_cart', 'POST', cartData);
  
  if (error) {
    console.log('❌ Network error:', error);
    return null;
  }
  
  if (response.status === 200 && result.success) {
    console.log('✅ Cart created successfully');
    console.log('   Cart ID:', result.data.id);
    console.log('   Table ID:', result.data.table_id);
    console.log('   Status:', result.data.status);
    return result.data;
  } else {
    console.log('❌ Failed:', result.error);
    return null;
  }
}

async function testAddToCart(cartId, menuItemId) {
  console.log('➕ Testing add_to_cart...');
  
  const cartItemData = {
    cart_id: cartId,
    menu_item_id: menuItemId,
    quantity: 2,
    notes: 'Extra cheese please'
  };

  const { response, result, error } = await callFunction('add_to_cart', 'POST', cartItemData);
  
  if (error) {
    console.log('❌ Network error:', error);
    return null;
  }
  
  if (response.status === 200 && result.success) {
    console.log('✅ Item added to cart successfully');
    console.log('   Quantity:', result.data.quantity);
    console.log('   Notes:', result.data.notes);
    return result.data;
  } else {
    console.log('❌ Failed:', result.error);
    return null;
  }
}

async function testAddMoreToCart(cartId, menuItemId) {
  console.log('➕ Testing add_to_cart (increasing quantity)...');
  
  const cartItemData = {
    cart_id: cartId,
    menu_item_id: menuItemId,
    quantity: 1, // This should increase the existing quantity
    notes: 'Updated notes'
  };

  const { response, result, error } = await callFunction('add_to_cart', 'POST', cartItemData);
  
  if (error) {
    console.log('❌ Network error:', error);
    return null;
  }
  
  if (response.status === 200 && result.success) {
    console.log('✅ Item quantity increased successfully');
    console.log('   New quantity:', result.data.quantity);
    return result.data;
  } else {
    console.log('❌ Failed:', result.error);
    return null;
  }
}

async function testGetCart(cartId) {
  console.log('🛒 Testing get_cart...');
  
  const { response, result, error } = await callFunction('get_cart', 'GET', null, `?cart_id=${cartId}`);
  
  if (error) {
    console.log('❌ Network error:', error);
    return null;
  }
  
  if (response.status === 200 && result.success) {
    console.log('✅ Cart retrieved successfully');
    const cart = result.data;
    console.log('   Cart ID:', cart.id);
    console.log('   Status:', cart.status);
    console.log('   Items count:', cart.cart_items ? cart.cart_items.length : 0);
    
    if (cart.cart_items) {
      cart.cart_items.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.menu_item.name} x${item.quantity} - $${item.menu_item.cost * item.quantity}`);
      });
    }
    return cart;
  } else {
    console.log('❌ Failed:', result.error);
    return null;
  }
}

async function testRemoveFromCart(cartId, menuItemId) {
  console.log('➖ Testing remove_from_cart (partial)...');
  
  const removeData = {
    cart_id: cartId,
    menu_item_id: menuItemId,
    quantity: 1 // Remove 1 item
  };

  const { response, result, error } = await callFunction('remove_from_cart', 'POST', removeData);
  
  if (error) {
    console.log('❌ Network error:', error);
    return null;
  }
  
  if (response.status === 200 && result.success) {
    console.log('✅ Item quantity reduced successfully');
    console.log('   Remaining quantity:', result.data.quantity);
    return result.data;
  } else {
    console.log('❌ Failed:', result.error);
    return null;
  }
}

async function testRemoveAllFromCart(cartId, menuItemId) {
  console.log('➖ Testing remove_from_cart (all)...');
  
  const removeData = {
    cart_id: cartId,
    menu_item_id: menuItemId
    // No quantity specified - should remove all
  };

  const { response, result, error } = await callFunction('remove_from_cart', 'POST', removeData);
  
  if (error) {
    console.log('❌ Network error:', error);
    return null;
  }
  
  if (response.status === 200 && result.success) {
    console.log('✅ All items removed successfully');
    console.log('   Message:', result.data.message);
    return result.data;
  } else {
    console.log('❌ Failed:', result.error);
    return null;
  }
}

async function testGetCartByTable(restaurantId, tableId) {
  console.log('🛒 Testing get_cart by table...');
  
  const { response, result, error } = await callFunction('get_cart', 'GET', null, `?restaurant_id=${restaurantId}&table_id=${tableId}`);
  
  if (error) {
    console.log('❌ Network error:', error);
    return null;
  }
  
  if (response.status === 200 && result.success) {
    console.log('✅ Cart retrieved by table successfully');
    const cart = result.data;
    console.log('   Cart ID:', cart.id);
    console.log('   Table Number:', cart.table.table_number);
    return cart;
  } else {
    console.log('❌ Failed:', result.error);
    return null;
  }
}

// Run tests
async function runCartTests(restaurantId, tableId, menuItemId) {
  console.log('🚀 Running Cart Tests');
  console.log('=' * 40);
  
  if (!restaurantId || !tableId || !menuItemId) {
    console.log('⚠️  Restaurant ID, Table ID, and Menu Item ID required for cart tests');
    return null;
  }
  
  const cart = await testCreateCart(restaurantId, tableId);
  if (!cart) return null;
  
  await testAddToCart(cart.id, menuItemId);
  await testAddMoreToCart(cart.id, menuItemId);
  await testGetCart(cart.id);
  await testRemoveFromCart(cart.id, menuItemId);
  await testGetCartByTable(restaurantId, tableId);
  await testRemoveAllFromCart(cart.id, menuItemId);
  
  console.log('\n✅ Cart tests completed!');
  return cart;
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runCartTests, callFunction };
} else {
  // Run if called directly
  console.log('Please provide restaurant ID, table ID, and menu item ID to run cart tests');
}
