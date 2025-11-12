/**
 * Test All Services Script
 *
 * Runs all service tests in sequence
 * Run with: npm run test:all or tsx scripts/test-all.ts
 */

import { execSync } from 'child_process';

const tests = [
  { name: 'User Service', script: 'npm run test:user' },
  { name: 'Session Service', script: 'npm run test:session' },
  { name: 'Module Service', script: 'npm run test:module' },
  { name: 'Chat Service', script: 'npm run test:chat' },
];

async function runAllTests() {
  console.log('Running All Service Tests\n');
  console.log('=' .repeat(70));
  console.log('This will run all service tests in sequence.');
  console.log('Note: Session and Chat tests will make real OpenAI API calls.');
  console.log('=' .repeat(70) + '\n');

  const results: { name: string; success: boolean; error?: string }[] = [];

  for (const test of tests) {
    console.log(`\n${'#'.repeat(70)}`);
    console.log(`# Running: ${test.name}`);
    console.log('#'.repeat(70) + '\n');

    try {
      execSync(test.script, { stdio: 'inherit' });
      results.push({ name: test.name, success: true });
      console.log(`\n${test.name} completed successfully\n`);
    } catch (error: any) {
      results.push({ name: test.name, success: false, error: error.message });
      console.log(`\n${test.name} failed\n`);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('Test Summary');
  console.log('='.repeat(70));

  results.forEach((result) => {
    const status = result.success ? '[PASS]' : '[FAIL]';
    console.log(`${status} ${result.name}: ${result.success ? 'PASSED' : 'FAILED'}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log('\n' + '='.repeat(70));
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(70) + '\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((error) => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
