#!/usr/bin/env node

/**
 * Authentication Tests
 * Tests different authentication methods and keys
 */

const SUPABASE_URL = 'https://rphjsyyppyrvkjuzlxun.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sbp_42a8990813ad55e00fc7e06225dce6aa4794a564';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwaGpzeXlwcHlydmtqdXpseHVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzU3OTEsImV4cCI6MjA3NTk1MTc5MX0.AgyLFtjZbPwxIVRHpdq8phNY5DcB7FZQuBLycAFNacw';

async function testAuth(description, key) {
  console.log(`\n🔑 Testing ${description}...`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create_restaurant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        name: 'Auth Test',
        email: 'test@auth.com',
        password_hash: 'test123'
      })
    });
    
    const result = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (response.status === 200) {
      console.log('✅ Authentication successful!');
      return true;
    } else if (response.status === 500 && result.error && result.error.includes('relation "restaurants" does not exist')) {
      console.log('✅ Authentication successful! Database needs setup.');
      return true;
    } else {
      console.log('❌ Authentication failed.');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return false;
  }
}

async function runAuthTests() {
  console.log('🚀 Testing Supabase Authentication');
  console.log('=' * 50);
  
  const serviceRoleSuccess = await testAuth('Service Role Key', SUPABASE_SERVICE_ROLE_KEY);
  const anonSuccess = await testAuth('Anon Key', SUPABASE_ANON_KEY);
  
  console.log('\n📊 Results:');
  console.log(`Service Role Key: ${serviceRoleSuccess ? '✅' : '❌'}`);
  console.log(`Anon Key: ${anonSuccess ? '✅' : '❌'}`);
  
  if (!serviceRoleSuccess && !anonSuccess) {
    console.log('\n⚠️  Both keys failed. Please check:');
    console.log('1. Supabase project is active');
    console.log('2. Functions are deployed');
    console.log('3. Keys are correct');
    console.log('4. Database is set up');
  }
}

runAuthTests();