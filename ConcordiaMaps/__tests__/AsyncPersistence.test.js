import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  saveToAsyncStorage,
  getFromAsyncStorage,
} from "../components/AsyncPersistence";

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

describe("AsyncPersistence Tests", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("should save data to AsyncStorage", async () => {
    const key = "lastCampus";
    const value = "H3G 1M8";

    await saveToAsyncStorage(key, value);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(key, value);
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it("should handle errors when saving data to AsyncStorage", async () => {
    const key = "lastCampus";
    const value = "H3G 1M8";
    const errorMessage = "Error saving campus";

    AsyncStorage.setItem.mockRejectedValueOnce(new Error(errorMessage));

    await saveToAsyncStorage(key, value);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(key, value);
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    // You can also check if the error was logged to the console
  });

  it("should retrieve data from AsyncStorage", async () => {
    const key = "lastCampus";
    const defaultValue = "H3G 1M8";
    const storedValue = "H4B 1R6";

    AsyncStorage.getItem.mockResolvedValueOnce(storedValue);

    const result = await getFromAsyncStorage(key, defaultValue);

    expect(AsyncStorage.getItem).toHaveBeenCalledWith(key);
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
    expect(result).toBe(storedValue);
  });

  it("should return default value if data is not found in AsyncStorage", async () => {
    const key = "lastCampus";
    const defaultValue = "H3G 1M8";

    AsyncStorage.getItem.mockResolvedValueOnce(null);

    const result = await getFromAsyncStorage(key, defaultValue);

    expect(AsyncStorage.getItem).toHaveBeenCalledWith(key);
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
    expect(result).toBe(defaultValue);
  });

  it("should handle errors when retrieving data from AsyncStorage", async () => {
    const key = "lastCampus";
    const defaultValue = "H3G 1M8";
    const errorMessage = "Error retrieving campus";

    AsyncStorage.getItem.mockRejectedValueOnce(new Error(errorMessage));

    const result = await getFromAsyncStorage(key, defaultValue);

    expect(AsyncStorage.getItem).toHaveBeenCalledWith(key);
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
    expect(result).toBe(defaultValue);
    // You can also check if the error was logged to the console
  });
});
