#!/usr/bin/env node

/**
 * Pre-commit script that runs Prettier, ESLint, and tests
 * This script is designed to be called manually before committing
 */

const { execSync } = require("child_process");

// ANSI color codes for output formatting
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

// Export functions for testing
function runCommand(command, errorMessage) {
  try {
    console.log(`${CYAN}Running: ${command}${RESET}`);
    execSync(command, { stdio: "inherit" });
    console.log(`${GREEN}✓ Passed!${RESET}\n`);
    return true;
  } catch (error) {
    console.error(`${RED}✗ Failed: ${errorMessage}${RESET}\n`);
    console.error(`${RED}Error details: ${error.message}${RESET}\n`);
    process.exit(1);
  }
}

function runPreCommitChecks() {
  console.log(`${CYAN}Starting pre-commit checks...${RESET}\n`);

  // Run Prettier on all relevant files
  runCommand(
    'npx prettier "*/*.{js,jsx,ts,tsx,json,css,scss,md}" --write --ignore-path .gitignore',
    "Code formatting issues found. Please fix them and try again."
  );

  // Run ESLint
  runCommand(
    "npx eslint . --ignore-pattern node_modules/ --ignore-pattern .expo/ --ignore-pattern .coverage/ --ignore-pattern coverage/",
    "ESLint issues found. Please fix them and try again."
  );

  // Run tests
  runCommand("npm test", "Tests failed. Please fix them and try again.");

  console.log(`${GREEN}All checks passed successfully!${RESET}`);
}

// Only run the script if it's called directly (not imported)
if (require.main === module) {
  runPreCommitChecks();
}

module.exports = { runCommand, runPreCommitChecks };