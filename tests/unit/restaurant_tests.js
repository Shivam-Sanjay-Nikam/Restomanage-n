/**
 * Restaurant Management Tests
 * Tests create_restaurant function
 */

const SUPABASE_URL = 'https://rphjsyyppyrvkjuzlxun.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwaGpzeXlwcHlydmtqdXpseHVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzU3OTEsImV4cCI6MjA3NTk1MTc5MX0.AgyLFtjZbPwxIVRHpdq8phNY5DcB7FZQuBLycAFNacw';

async function callFunction(functionName, method = 'GET', data = null) {
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;
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

async function testCreateRestaurant() {
  console.log('🏪 Testing create_restaurant...');
  
  const restaurantData = {
    name: 'Test Restaurant ' + Date.now(),
    email: `test${Date.now()}@restaurant.com`,
    password_hash: 'hashed_password_123',
    address: '123 Test Street',
    phone: '+1234567890'
  };

  const { response, result, error } = await callFunction('create_restaurant', 'POST', restaurantData);
  
  if (error) {
    console.log('❌ Network error:', error);
    return null;
  }
  
  if (response.status === 200 && result.success) {
    console.log('✅ Restaurant created successfully');
    console.log('   ID:', result.data.id);
    console.log('   Name:', result.data.name);
    console.log('   Email:', result.data.email);
    return result.data;
  } else {
    console.log('❌ Failed:', result.error);
    return null;
  }
}

async function testCreateRestaurantValidation() {
  console.log('🧪 Testing create_restaurant validation...');
  
  const invalidData = {
    name: 'Test Restaurant',
    // Missing email and password_hash
  };

  const { response, result, error } = await callFunction('create_restaurant', 'POST', invalidData);
  
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

async function testCreateRestaurantDuplicateEmail() {
  console.log('🧪 Testing create_restaurant duplicate email...');
  
  const restaurantData = {
    name: 'Duplicate Test Restaurant',
    email: 'duplicate@restaurant.com',
    password_hash: 'hashed_password_123'
  };

  // Create first restaurant
  const { response: response1, result: result1 } = await callFunction('create_restaurant', 'POST', restaurantData);
  
  if (response1.status === 200 && result1.success) {
    console.log('✅ First restaurant created');
    
    // Try to create duplicate
    const { response: response2, result: result2 } = await callFunction('create_restaurant', 'POST', restaurantData);
    
    if (response2.status === 400 && !result2.success) {
      console.log('✅ Duplicate email validation working');
      console.log('   Error:', result2.error);
      return true;
    } else {
      console.log('❌ Duplicate email should have been rejected');
      return false;
    }
  } else {
    console.log('❌ Failed to create first restaurant');
    return false;
  }
}

// Run tests
async function runRestaurantTests() {
  console.log('🚀 Running Restaurant Tests');
  console.log('=' * 40);
  
  const restaurant = await testCreateRestaurant();
  await testCreateRestaurantValidation();
  await testCreateRestaurantDuplicateEmail();
  
  console.log('\n✅ Restaurant tests completed!');
  return restaurant;
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runRestaurantTests, callFunction };
} else {
  // Run if called directly
  runRestaurantTests();
}
