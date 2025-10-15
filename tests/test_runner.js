#!/usr/bin/env node

/**
 * Single Comprehensive Test Runner
 * Runs all tests in organized categories with clean output
 */

const { callFunction } = require('./test_utils');

// Import all test modules
const { runValidationTests } = require('./unit/validation_tests');
const { runErrorHandlingTests } = require('./unit/error_handling_tests');
const { runRestaurantTests } = require('./unit/restaurant_tests');
const { runMenuTests } = require('./unit/menu_tests');
const { runCartTests } = require('./unit/cart_tests');
const { runOrderTests } = require('./unit/order_tests');

const { runIntegrationTests } = require('./integration/restaurant_workflow_tests');
const { runDataRelationshipTests } = require('./integration/data_relationship_tests');

const { runE2ETests } = require('./e2e/complete_restaurant_flow_tests');
const { runMultiRestaurantTests } = require('./e2e/multi_restaurant_scenario_tests');

const { runLoadTests } = require('./performance/load_tests');
const { runSecurityTests } = require('./security/security_tests');

class TestRunner {
  constructor() {
    this.results = {
      unit: { passed: 0, failed: 0, tests: [] },
      integration: { passed: 0, failed: 0, tests: [] },
      e2e: { passed: 0, failed: 0, tests: [] },
      performance: { success: false, duration: 0 },
      security: { success: false, duration: 0 }
    };
    this.startTime = Date.now();
  }

  async runConnectivityTest() {
    console.log('🔗 Testing API Connectivity...');
    
    try {
      const { response, result } = await callFunction('create_restaurant', 'POST', {
        name: 'Connectivity Test',
        email: `connectivity${Date.now()}@test.com`,
        password_hash: 'test123'
      });
      
      if (response.status === 200 && result.success) {
        console.log('✅ API connectivity: PASSED');
        return true;
      } else {
        console.log('❌ API connectivity: FAILED');
        return false;
      }
    } catch (error) {
      console.log(`❌ API connectivity: FAILED - ${error.message}`);
      return false;
    }
  }

  async runUnitTests() {
    console.log('\n🔬 Running Unit Tests...');
    console.log('=' * 50);
    
    const unitTests = [
      { name: 'Input Validation', fn: runValidationTests },
      { name: 'Error Handling', fn: runErrorHandlingTests },
      { name: 'Restaurant Functions', fn: runRestaurantTests },
      { name: 'Menu Functions', fn: runMenuTests },
      { name: 'Cart Functions', fn: runCartTests },
      { name: 'Order Functions', fn: runOrderTests }
    ];
    
    for (const test of unitTests) {
      try {
        console.log(`\n🧪 ${test.name}...`);
        const result = await test.fn();
        
        if (result && typeof result === 'object') {
          if (result.passed !== undefined && result.failed !== undefined) {
            this.results.unit.passed += result.passed;
            this.results.unit.failed += result.failed;
            this.results.unit.tests.push({ name: test.name, ...result });
            console.log(`  ✅ ${result.passed} passed, ${result.failed} failed`);
          } else {
            this.results.unit.tests.push({ name: test.name, status: 'completed' });
            console.log(`  ✅ Completed`);
          }
        } else {
          this.results.unit.tests.push({ name: test.name, status: 'completed' });
          console.log(`  ✅ Completed`);
        }
      } catch (error) {
        this.results.unit.failed++;
        this.results.unit.tests.push({ name: test.name, status: 'error', error: error.message });
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Unit Tests: ${this.results.unit.passed} passed, ${this.results.unit.failed} failed`);
  }

  async runIntegrationTests() {
    console.log('\n🔗 Running Integration Tests...');
    console.log('=' * 50);
    
    const integrationTests = [
      { name: 'Restaurant Workflow', fn: runIntegrationTests },
      { name: 'Data Relationships', fn: runDataRelationshipTests }
    ];
    
    for (const test of integrationTests) {
      try {
        console.log(`\n🧪 ${test.name}...`);
        const result = await test.fn();
        
        if (result && typeof result === 'object') {
          if (result.totalPassed !== undefined && result.totalFailed !== undefined) {
            this.results.integration.passed += result.totalPassed;
            this.results.integration.failed += result.totalFailed;
            this.results.integration.tests.push({ name: test.name, ...result });
            console.log(`  ✅ ${result.totalPassed} passed, ${result.totalFailed} failed`);
          } else {
            this.results.integration.tests.push({ name: test.name, status: 'completed' });
            console.log(`  ✅ Completed`);
          }
        } else {
          this.results.integration.tests.push({ name: test.name, status: 'completed' });
          console.log(`  ✅ Completed`);
        }
      } catch (error) {
        this.results.integration.failed++;
        this.results.integration.tests.push({ name: test.name, status: 'error', error: error.message });
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Integration Tests: ${this.results.integration.passed} passed, ${this.results.integration.failed} failed`);
  }

  async runE2ETests() {
    console.log('\n🎯 Running End-to-End Tests...');
    console.log('=' * 50);
    
    const e2eTests = [
      { name: 'Complete Restaurant Flow', fn: runE2ETests },
      { name: 'Multi-Restaurant Scenarios', fn: runMultiRestaurantTests }
    ];
    
    for (const test of e2eTests) {
      try {
        console.log(`\n🧪 ${test.name}...`);
        const result = await test.fn();
        
        if (result && typeof result === 'object') {
          if (result.overallSuccess !== undefined) {
            if (result.overallSuccess) {
              this.results.e2e.passed++;
              console.log(`  ✅ PASSED`);
            } else {
              this.results.e2e.failed++;
              console.log(`  ❌ FAILED`);
            }
            this.results.e2e.tests.push({ name: test.name, success: result.overallSuccess, ...result });
          } else {
            this.results.e2e.tests.push({ name: test.name, status: 'completed' });
            console.log(`  ✅ Completed`);
          }
        } else {
          this.results.e2e.tests.push({ name: test.name, status: 'completed' });
          console.log(`  ✅ Completed`);
        }
      } catch (error) {
        this.results.e2e.failed++;
        this.results.e2e.tests.push({ name: test.name, status: 'error', error: error.message });
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
    
    console.log(`\n📊 E2E Tests: ${this.results.e2e.passed} passed, ${this.results.e2e.failed} failed`);
  }

  async runPerformanceTests() {
    console.log('\n⚡ Running Performance Tests...');
    console.log('=' * 50);
    
    const startTime = Date.now();
    
    try {
      const result = await runLoadTests();
      const endTime = Date.now();
      this.results.performance.duration = (endTime - startTime) / 1000;
      this.results.performance.success = true;
      console.log(`  ✅ Performance tests completed in ${this.results.performance.duration.toFixed(2)}s`);
    } catch (error) {
      this.results.performance.success = false;
      console.log(`  ❌ Performance tests failed: ${error.message}`);
    }
  }

  async runSecurityTests() {
    console.log('\n🔒 Running Security Tests...');
    console.log('=' * 50);
    
    const startTime = Date.now();
    
    try {
      const result = await runSecurityTests();
      const endTime = Date.now();
      this.results.security.duration = (endTime - startTime) / 1000;
      this.results.security.success = true;
      console.log(`  ✅ Security tests completed in ${this.results.security.duration.toFixed(2)}s`);
    } catch (error) {
      this.results.security.success = false;
      console.log(`  ❌ Security tests failed: ${error.message}`);
    }
  }

  printSummary() {
    const endTime = Date.now();
    const totalDuration = (endTime - this.startTime) / 1000;
    
    const totalPassed = this.results.unit.passed + this.results.integration.passed + this.results.e2e.passed;
    const totalFailed = this.results.unit.failed + this.results.integration.failed + this.results.e2e.failed;
    const successRate = totalPassed / (totalPassed + totalFailed) * 100;
    
    console.log('\n🎉 TEST SUITE RESULTS');
    console.log('=' * 60);
    console.log(`✅ Total Passed: ${totalPassed}`);
    if (totalFailed > 0) {
      console.log(`❌ Total Failed: ${totalFailed}`);
    } else {
      console.log(`✅ Total Failed: ${totalFailed}`);
    }
    console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`⏱️  Total Duration: ${totalDuration.toFixed(2)}s`);
    console.log(`📅 Completed at: ${new Date().toLocaleString()}`);
    
    console.log('\n📋 Category Breakdown:');
    console.log(`  🔬 Unit Tests: ${this.results.unit.passed} passed, ${this.results.unit.failed > 0 ? '❌' : '✅'} ${this.results.unit.failed} failed`);
    console.log(`  🔗 Integration Tests: ${this.results.integration.passed} passed, ${this.results.integration.failed > 0 ? '❌' : '✅'} ${this.results.integration.failed} failed`);
    console.log(`  🎯 E2E Tests: ${this.results.e2e.passed} passed, ${this.results.e2e.failed > 0 ? '❌' : '✅'} ${this.results.e2e.failed} failed`);
    console.log(`  ⚡ Performance Tests: ${this.results.performance.success ? 'PASSED' : 'FAILED'}`);
    console.log(`  🔒 Security Tests: ${this.results.security.success ? 'PASSED' : 'FAILED'}`);
    
    if (totalFailed === 0 && this.results.performance.success && this.results.security.success) {
      console.log('\n🎉 ALL TESTS PASSED! 🎉');
      console.log('Your Restaurant Management Backend is working perfectly!');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the results above.');
    }
    
    return {
      totalPassed,
      totalFailed,
      successRate,
      totalDuration,
      allPassed: totalFailed === 0 && this.results.performance.success && this.results.security.success
    };
  }

  async runAllTests() {
    console.log('🎯 Restaurant Management Backend - Complete Test Suite');
    console.log('=' * 70);
    console.log(`🔗 Testing against: https://rphjsyyppyrvkjuzlxun.supabase.co`);
    console.log(`📅 Started at: ${new Date().toLocaleString()}`);
    console.log('=' * 70);
    
    // Quick connectivity test
    const connectivity = await this.runConnectivityTest();
    if (!connectivity) {
      console.log('\n❌ Connectivity test failed. Please check your Supabase configuration.');
      return false;
    }
    
    // Run all test categories
    await this.runUnitTests();
    await this.runIntegrationTests();
    await this.runE2ETests();
    await this.runPerformanceTests();
    await this.runSecurityTests();
    
    // Print summary
    const summary = this.printSummary();
    return summary.allPassed;
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const runner = new TestRunner();
  
  if (args.includes('--unit')) {
    runner.runConnectivityTest().then(connected => {
      if (connected) {
        runner.runUnitTests().then(() => {
          process.exit(runner.results.unit.failed > 0 ? 1 : 0);
        });
      } else {
        process.exit(1);
      }
    });
  } else if (args.includes('--integration')) {
    runner.runConnectivityTest().then(connected => {
      if (connected) {
        runner.runIntegrationTests().then(() => {
          process.exit(runner.results.integration.failed > 0 ? 1 : 0);
        });
      } else {
        process.exit(1);
      }
    });
  } else if (args.includes('--e2e')) {
    runner.runConnectivityTest().then(connected => {
      if (connected) {
        runner.runE2ETests().then(() => {
          process.exit(runner.results.e2e.failed > 0 ? 1 : 0);
        });
      } else {
        process.exit(1);
      }
    });
  } else if (args.includes('--performance')) {
    runner.runConnectivityTest().then(connected => {
      if (connected) {
        runner.runPerformanceTests().then(() => {
          process.exit(runner.results.performance.success ? 0 : 1);
        });
      } else {
        process.exit(1);
      }
    });
  } else if (args.includes('--security')) {
    runner.runConnectivityTest().then(connected => {
      if (connected) {
        runner.runSecurityTests().then(() => {
          process.exit(runner.results.security.success ? 0 : 1);
        });
      } else {
        process.exit(1);
      }
    });
  } else if (args.includes('--quick')) {
    runner.runConnectivityTest().then(success => {
      process.exit(success ? 0 : 1);
    });
  } else {
    runner.runAllTests().then(success => {
      process.exit(success ? 0 : 1);
    });
  }
}

module.exports = TestRunner;
