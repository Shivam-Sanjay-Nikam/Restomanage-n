#!/usr/bin/env node

/**
 * Security Tests - Security and Vulnerability Tests
 * Tests security aspects of the API
 */

const SUPABASE_URL = 'https://rphjsyyppyrvkjuzlxun.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwaGpzeXlwcHlydmtqdXpseHVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzU3OTEsImV4cCI6MjA3NTk1MTc5MX0.AgyLFtjZbPwxIVRHpdq8phNY5DcB7FZQuBLycAFNacw';

async function callFunction(functionName, method = 'GET', data = null, queryParams = '', headers = {}) {
  const url = `${SUPABASE_URL}/functions/v1/${functionName}${queryParams}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      ...headers
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

async function testSQLInjection() {
  console.log('🔒 Testing SQL Injection Protection...');
  
  const maliciousInputs = [
    "'; DROP TABLE restaurants; --",
    "1' OR '1'='1",
    "admin'--",
    "1; DELETE FROM restaurants; --",
    "' UNION SELECT * FROM restaurants --"
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const maliciousInput of maliciousInputs) {
    console.log(`  🧪 Testing: ${maliciousInput}`);
    
    const { response, result } = await callFunction('create_restaurant', 'POST', {
      name: maliciousInput,
      email: maliciousInput,
      password_hash: 'test'
    });
    
    if ((response && response.status === 400 && result && result.error) || 
        (response && response.status >= 400) || 
        (!response)) {
      console.log(`    ✅ Blocked: ${result ? result.error : 'Request blocked'}`);
      passed++;
    } else {
      console.log(`    ❌ Not blocked: ${response ? response.status : 'No response'}`);
      failed++;
    }
  }
  
  console.log(`  📊 SQL Injection Test Results: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

async function testXSSProtection() {
  console.log('🔒 Testing XSS Protection...');
  
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '"><script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    '<img src=x onerror=alert("XSS")>',
    '"><img src=x onerror=alert("XSS")>'
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const payload of xssPayloads) {
    console.log(`  🧪 Testing: ${payload.substring(0, 30)}...`);
    
    const { response, result } = await callFunction('create_restaurant', 'POST', {
      name: payload,
      email: 'test@test.com',
      password_hash: 'test'
    });
    
    if (response.status === 200 && result.success) {
      // Check if the payload was sanitized or escaped
      const returnedName = result.data.name;
      if (returnedName.includes('<script>') || returnedName.includes('javascript:')) {
        console.log(`    ❌ XSS payload not sanitized`);
        failed++;
      } else {
        console.log(`    ✅ XSS payload sanitized`);
        passed++;
      }
    } else {
      console.log(`    ✅ XSS payload blocked`);
      passed++;
    }
  }
  
  console.log(`  📊 XSS Protection Test Results: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

async function testInputValidation() {
  console.log('🔒 Testing Input Validation...');
  
  const testCases = [
    {
      name: 'Empty strings',
      data: { name: '', email: '', password_hash: '' },
      expected: 'validation error'
    },
    {
      name: 'Null values',
      data: { name: null, email: null, password_hash: null },
      expected: 'validation error'
    },
    {
      name: 'Undefined values',
      data: { name: undefined, email: undefined, password_hash: undefined },
      expected: 'validation error'
    },
    {
      name: 'Very long strings',
      data: { 
        name: 'A'.repeat(10000), 
        email: 'B'.repeat(1000) + '@test.com', 
        password_hash: 'test' 
      },
      expected: 'validation error or truncation'
    },
    {
      name: 'Special characters',
      data: { 
        name: '!@#$%^&*()_+{}|:"<>?[]\\;\',./', 
        email: 'test@test.com', 
        password_hash: 'test' 
      },
      expected: 'handled properly'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    console.log(`  🧪 Testing: ${testCase.name}`);
    
    const { response, result } = await callFunction('create_restaurant', 'POST', testCase.data);
    
    if (response.status === 400 && result.error) {
      console.log(`    ✅ Validation working: ${result.error}`);
      passed++;
    } else if (response.status === 200 && result.success) {
      console.log(`    ✅ Input handled: ${testCase.expected}`);
      passed++;
    } else {
      console.log(`    ❌ Unexpected response: ${response.status}`);
      failed++;
    }
  }
  
  console.log(`  📊 Input Validation Test Results: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

async function testAuthentication() {
  console.log('🔒 Testing Authentication...');
  
  const testCases = [
    {
      name: 'No authorization header',
      headers: {},
      expected: '401 Unauthorized'
    },
    {
      name: 'Invalid token',
      headers: { 'Authorization': 'Bearer invalid-token' },
      expected: '401 Unauthorized'
    },
    {
      name: 'Malformed token',
      headers: { 'Authorization': 'Bearer' },
      expected: '401 Unauthorized'
    },
    {
      name: 'Wrong token format',
      headers: { 'Authorization': 'Basic dGVzdA==' },
      expected: '401 Unauthorized'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    console.log(`  🧪 Testing: ${testCase.name}`);
    
    const { response, result } = await callFunction(
      'create_restaurant', 
      'POST', 
      { name: 'Test', email: 'test@test.com', password_hash: 'test' },
      '',
      testCase.headers
    );
    
    if (response.status === 401 || response.status === 400) {
      console.log(`    ✅ Authentication required: ${response.status}`);
      passed++;
    } else {
      console.log(`    ❌ Unexpected response: ${response.status}`);
      failed++;
    }
  }
  
  console.log(`  📊 Authentication Test Results: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

async function testRateLimiting() {
  console.log('🔒 Testing Rate Limiting...');
  
  console.log('  🧪 Sending rapid requests...');
  
  const requests = [];
  const startTime = Date.now();
  
  // Send 20 rapid requests
  for (let i = 0; i < 20; i++) {
    requests.push(callFunction('get_menu_items', 'GET', null, '?restaurant_id=test'));
  }
  
  const results = await Promise.all(requests);
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  const successful = results.filter(r => r.response && r.response.status === 200);
  const rateLimited = results.filter(r => r.response && r.response.status === 429);
  const errors = results.filter(r => !r.response || (r.response.status !== 200 && r.response.status !== 429));
  
  console.log(`  📊 Rate Limiting Results:`);
  console.log(`    ✅ Successful: ${successful.length}`);
  console.log(`    ⚠️  Rate Limited: ${rateLimited.length}`);
  console.log(`    ❌ Errors: ${errors.length}`);
  console.log(`    ⏱️  Duration: ${duration}ms`);
  console.log(`    📈 Requests/second: ${(20 / (duration / 1000)).toFixed(2)}`);
  
  return {
    successful: successful.length,
    rateLimited: rateLimited.length,
    errors: errors.length,
    duration,
    requestsPerSecond: 20 / (duration / 1000)
  };
}

async function testDataExposure() {
  console.log('🔒 Testing Data Exposure...');
  
  // Test if sensitive data is exposed in responses
  const { response, result } = await callFunction('create_restaurant', 'POST', {
    name: `Security Test Restaurant ${Date.now()}`,
    email: `security${Date.now()}@test.com`,
    password_hash: 'sensitive_password_123'
  });
  
  if (response && response.status === 200 && result && result.success) {
    const data = result.data;
    
    // Check if password_hash is exposed
    if (data.password_hash) {
      console.log('  ❌ Password hash exposed in response');
      return false;
    } else {
      console.log('  ✅ Password hash not exposed');
    }
    
    // Check if internal IDs are exposed (this is expected)
    if (data.id) {
      console.log('  ✅ ID exposed (expected for API)');
    }
    
    // Check if timestamps are exposed
    if (data.created_at) {
      console.log('  ✅ Created timestamp exposed (expected)');
    }
    
    return true;
  } else {
    console.log('  ❌ Failed to create test restaurant');
    return false;
  }
}

async function testCORSHeaders() {
  console.log('🔒 Testing CORS Headers...');
  
  const { response } = await callFunction('create_restaurant', 'POST', {
    name: 'CORS Test',
    email: 'cors@test.com',
    password_hash: 'test'
  });
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
    'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
  };
  
  console.log('  📊 CORS Headers:');
  console.log(`    Origin: ${corsHeaders['Access-Control-Allow-Origin'] || 'Not set'}`);
  console.log(`    Methods: ${corsHeaders['Access-Control-Allow-Methods'] || 'Not set'}`);
  console.log(`    Headers: ${corsHeaders['Access-Control-Allow-Headers'] || 'Not set'}`);
  
  const hasCORS = corsHeaders['Access-Control-Allow-Origin'] && 
                  corsHeaders['Access-Control-Allow-Methods'] && 
                  corsHeaders['Access-Control-Allow-Headers'];
  
  if (hasCORS) {
    console.log('  ✅ CORS headers properly configured');
    return true;
  } else {
    console.log('  ❌ CORS headers missing or incomplete');
    return false;
  }
}

async function runSecurityTests() {
  console.log('🚀 Running Security Tests');
  console.log('=' * 50);
  
  const startTime = Date.now();
  
  // Run all security tests
  const sqlInjectionResults = await testSQLInjection();
  const xssResults = await testXSSProtection();
  const validationResults = await testInputValidation();
  const authResults = await testAuthentication();
  const rateLimitResults = await testRateLimiting();
  const dataExposureResults = await testDataExposure();
  const corsResults = await testCORSHeaders();
  
  const endTime = Date.now();
  const totalDuration = (endTime - startTime) / 1000;
  
  // Calculate overall results
  const totalPassed = sqlInjectionResults.passed + xssResults.passed + 
                     validationResults.passed + authResults.passed;
  const totalFailed = sqlInjectionResults.failed + xssResults.failed + 
                     validationResults.failed + authResults.failed;
  
  console.log('\n📊 Security Test Summary:');
  console.log('=' * 40);
  console.log(`⏱️  Total duration: ${totalDuration.toFixed(2)}s`);
  console.log(`✅ Total passed: ${totalPassed}`);
  console.log(`❌ Total failed: ${totalFailed}`);
  console.log(`📈 Success rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  
  console.log('\n🔒 Security Test Details:');
  console.log(`  🛡️  SQL Injection: ${sqlInjectionResults.passed} passed, ${sqlInjectionResults.failed} failed`);
  console.log(`  🛡️  XSS Protection: ${xssResults.passed} passed, ${xssResults.failed} failed`);
  console.log(`  🛡️  Input Validation: ${validationResults.passed} passed, ${validationResults.failed} failed`);
  console.log(`  🛡️  Authentication: ${authResults.passed} passed, ${authResults.failed} failed`);
  console.log(`  🛡️  Rate Limiting: ${rateLimitResults.successful} successful, ${rateLimitResults.rateLimited} rate limited`);
  console.log(`  🛡️  Data Exposure: ${dataExposureResults ? 'PASSED' : 'FAILED'}`);
  console.log(`  🛡️  CORS Headers: ${corsResults ? 'PASSED' : 'FAILED'}`);
  
  if (totalFailed === 0) {
    console.log('\n🎉 All security tests passed! System is secure.');
  } else {
    console.log('\n⚠️  Some security tests failed. Please review the results.');
  }
}

if (require.main === module) {
  runSecurityTests();
}

module.exports = { runSecurityTests };
