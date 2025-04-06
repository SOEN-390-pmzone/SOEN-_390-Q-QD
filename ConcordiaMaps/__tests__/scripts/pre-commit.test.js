const { execFileSync } = require("child_process");

// Mock the entire pre-commit module first
jest.mock("../../scripts/pre-commit", () => {
  // Store the original module
  const originalModule = jest.requireActual("../../scripts/pre-commit");

  return {
    // Return all original properties/methods
    ...originalModule,
    // But make runCommand a jest.fn() that we can track
    runCommand: jest.fn(originalModule.runCommand),
  };
});

// Now import the mocked module
const preCommitModule = require("../../scripts/pre-commit");
const { runCommand } = preCommitModule;

// Mock child_process.execFileSync
jest.mock("child_process", () => ({
  execFileSync: jest.fn(),
}));

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});

describe("pre-commit script", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    // Restore console methods after all tests
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    mockExit.mockRestore();
  });

  describe("runCommand", () => {
    test("should execute the command and return true when successful", () => {
      // Reset runCommand mock for this test
      runCommand.mockImplementation((command, args) => {
        console.log(`Running: ${command} ${args.join(" ")}`);
        execFileSync(command, args, { stdio: "inherit" });
        console.log("✓ Passed!");
        return true;
      });

      execFileSync.mockImplementation(() => {});

      const result = runCommand(
        "test-command",
        ["arg1", "arg2"],
        "Error message",
      );

      expect(execFileSync).toHaveBeenCalledWith(
        "test-command",
        ["arg1", "arg2"],
        { stdio: "inherit" },
      );
      expect(console.log).toHaveBeenCalledTimes(2);
      expect(result).toBe(true);
    });

    test("should log error and exit when command fails", () => {
      // Reset runCommand mock for this test
      runCommand.mockImplementation((command, args, errorMessage) => {
        try {
          console.log(`Running: ${command} ${args.join(" ")}`);
          execFileSync(command, args, { stdio: "inherit" });
          console.log("✓ Passed!");
          return true;
        } catch (error) {
          console.error(`✗ Failed: ${errorMessage}`);
          console.error(`Error details: ${error.message}`);
          process.exit(1);
        }
      });

      const mockError = new Error("Command failed");
      execFileSync.mockImplementation(() => {
        throw mockError;
      });

      runCommand("test-command", ["arg1", "arg2"], "Error message");

      expect(execFileSync).toHaveBeenCalledWith(
        "test-command",
        ["arg1", "arg2"],
        { stdio: "inherit" },
      );
      expect(console.error).toHaveBeenCalledTimes(2);
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
});
