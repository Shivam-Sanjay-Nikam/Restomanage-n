/**
 * Menu Management Tests
 * Tests create_menu_item, get_menu_items, update_menu_item functions
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

async function testCreateMenuItem(restaurantId) {
  console.log('🍔 Testing create_menu_item...');
  
  const menuItemData = {
    restaurant_id: restaurantId,
    name: 'Test Burger ' + Date.now(),
    description: 'A delicious test burger',
    category: 'Main Course',
    cost: 15.99,
    available: true
  };

  const { response, result, error } = await callFunction('create_menu_item', 'POST', menuItemData);
  
  if (error) {
    console.log('❌ Network error:', error);
    return null;
  }
  
  if (response.status === 200 && result.success) {
    console.log('✅ Menu item created successfully');
    console.log('   ID:', result.data.id);
    console.log('   Name:', result.data.name);
    console.log('   Cost:', result.data.cost);
    return result.data;
  } else {
    console.log('❌ Failed:', result.error);
    return null;
  }
}

async function testGetMenuItems(restaurantId) {
  console.log('📋 Testing get_menu_items...');
  
  const { response, result, error } = await callFunction('get_menu_items', 'GET', null, `?restaurant_id=${restaurantId}`);
  
  if (error) {
    console.log('❌ Network error:', error);
    return null;
  }
  
  if (response.status === 200 && result.success) {
    console.log('✅ Menu items retrieved successfully');
    console.log('   Count:', result.data.length);
    result.data.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} - $${item.cost} (${item.category})`);
    });
    return result.data;
  } else {
    console.log('❌ Failed:', result.error);
    return null;
  }
}

async function testGetMenuItemsByCategory(restaurantId) {
  console.log('📋 Testing get_menu_items by category...');
  
  const { response, result, error } = await callFunction('get_menu_items', 'GET', null, `?restaurant_id=${restaurantId}&category=Main Course`);
  
  if (error) {
    console.log('❌ Network error:', error);
    return null;
  }
  
  if (response.status === 200 && result.success) {
    console.log('✅ Menu items by category retrieved successfully');
    console.log('   Count:', result.data.length);
    result.data.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} - $${item.cost}`);
    });
    return result.data;
  } else {
    console.log('❌ Failed:', result.error);
    return null;
  }
}

async function testUpdateMenuItem(menuItemId) {
  console.log('✏️ Testing update_menu_item...');
  
  const updateData = {
    id: menuItemId,
    name: 'Updated Test Burger',
    description: 'An updated delicious test burger',
    cost: 18.99,
    available: false
  };

  const { response, result, error } = await callFunction('update_menu_item', 'PUT', updateData);
  
  if (error) {
    console.log('❌ Network error:', error);
    return null;
  }
  
  if (response.status === 200 && result.success) {
    console.log('✅ Menu item updated successfully');
    console.log('   New name:', result.data.name);
    console.log('   New cost:', result.data.cost);
    console.log('   Available:', result.data.available);
    return result.data;
  } else {
    console.log('❌ Failed:', result.error);
    return null;
  }
}

async function testCreateMenuItemValidation() {
  console.log('🧪 Testing create_menu_item validation...');
  
  const invalidData = {
    name: 'Test Item',
    // Missing restaurant_id, category, and cost
  };

  const { response, result, error } = await callFunction('create_menu_item', 'POST', invalidData);
  
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
async function runMenuTests(restaurantId) {
  console.log('🚀 Running Menu Tests');
  console.log('=' * 40);
  
  if (!restaurantId) {
    console.log('⚠️  Restaurant ID required for menu tests');
    return null;
  }
  
  const menuItem = await testCreateMenuItem(restaurantId);
  await testGetMenuItems(restaurantId);
  await testGetMenuItemsByCategory(restaurantId);
  await testCreateMenuItemValidation();
  
  if (menuItem) {
    await testUpdateMenuItem(menuItem.id);
  }
  
  console.log('\n✅ Menu tests completed!');
  return menuItem;
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runMenuTests, callFunction };
} else {
  // Run if called directly
  console.log('Please provide a restaurant ID to run menu tests');
}
