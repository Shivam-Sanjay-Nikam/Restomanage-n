#!/usr/bin/env node

/**
 * Simple connection test to verify Supabase functions are accessible
 */

const SUPABASE_URL = 'https://rphjsyyppyrvkjuzlxun.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sbp_42a8990813ad55e00fc7e06225dce6aa4794a564';

async function testConnection() {
  console.log('🔗 Testing Supabase connection...');
  console.log(`URL: ${SUPABASE_URL}`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create_restaurant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        name: 'Connection Test',
        email: 'test@connection.com',
        password_hash: 'test123'
      })
    });
    
    const result = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (response.status === 200) {
      console.log('✅ Connection successful! Functions are accessible.');
    } else if (response.status === 500 && result.error && result.error.includes('relation "restaurants" does not exist')) {
      console.log('⚠️  Functions are accessible but database needs to be set up.');
      console.log('   Please run setup_database.sql in your Supabase SQL Editor first.');
    } else {
      console.log('❌ Connection failed or unexpected response.');
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testConnection();
