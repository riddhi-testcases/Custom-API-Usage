const { execSync } = require("child_process");

console.log("Quick Test Runner for Custom API Task Usage System");
console.log("====================================================");

const runCommand = (command, description) => {
  console.log(`\n${description}...`);
  try {
    const output = execSync(command, { stdio: "inherit", cwd: process.cwd() });
    console.log(`${description} completed successfully`);
    return true;
  } catch (error) {
    console.log(`${description} failed`);
    return false;
  }
};

async function runTests() {
  console.log("\nPre-test Setup");

  runCommand("npm audit fix", "Fixing npm audit issues");

  runCommand("npm install", "Installing dependencies");

  console.log("\nRunning Tests");

  const results = {
    unit: runCommand("npm run test:unit", "Unit Tests"),
    integration: runCommand("npm run test:integration", "Integration Tests"),
    api: runCommand("npm run test:api", "API Tests"),
    coverage: runCommand("npm run test:coverage", "Coverage Report"),
  };

  console.log("\nTest Results Summary:");
  console.log("========================");

  Object.entries(results).forEach(([testType, passed]) => {
    const status = passed ? "PASSED" : "FAILED";
    const name = testType.charAt(0).toUpperCase() + testType.slice(1);
    console.log(`${status} ${name} Tests`);
  });

  const allPassed = Object.values(results).every((result) => result);

  console.log("\nView detailed coverage report at: coverage/index.html");

  if (allPassed) {
    console.log("\nALL TESTS PASSED!");
    process.exit(0);
  } else {
    console.log("\nSome tests failed. Check the output above.");
    process.exit(1);
  }
}

runTests();
