jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
// jest.setup.js

jest.mock("@expo/vector-icons", () => {
  return {
    MaterialIcons: "MaterialIcons",
  };
});

jest.mock("expo-font", () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
}));
