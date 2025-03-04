import AsyncStorage from "@react-native-async-storage/async-storage";
//if you need to persist data in your app, you can use AsyncStorage to store data locally on the device.
const saveToAsyncStorage = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error("Error saving campus:", error);
  }
};
const getFromAsyncStorage = async (key, defaultValue) => {
  try {
    const campus = await AsyncStorage.getItem(key);
    return campus || defaultValue; // Fallback to a default campus: SGW
  } catch (error) {
    console.error("Error retrieving campus:", error);
    return defaultValue;
  }
};

export { saveToAsyncStorage, getFromAsyncStorage };
