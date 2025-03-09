import React, { useState, createContext, useMemo, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screen/HomeScreen";
import { LocationProvider } from "./contexts/LocationContext";
import PopupModal from "./components/PopupModal";
import styles from "./styles";
import GetDirections from "./components/GetDirections";
import * as Amplitude from "expo-analytics-amplitude";

// Create Context for modal data and visibility
export const ModalContext = createContext();

const Stack = createNativeStackNavigator();

export default function App() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    name: "",
    coordinate: { latitude: 0, longitude: 0 },
  });

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  // Memoize the context value
  const modalContextValue = useMemo(
    () => ({ isModalVisible, modalData, toggleModal, setModalData }),
    [isModalVisible, modalData],
  );

  // Initialize Amplitude
  useEffect(() => {
    Amplitude.initializeAsync("3f731a5aff252dc984bf309ee6228f44"); // Replace with your API key
    Amplitude.logEventAsync("App Opened");
  }, []);

  return (
    <LocationProvider>
      {/* Provide the modal context to all components */}
      <ModalContext.Provider value={modalContextValue}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
              style={styles.container}
              name="Home"
              component={HomeScreen}
            />
            <Stack.Screen name="GetDirections" component={GetDirections} />
          </Stack.Navigator>
        </NavigationContainer>

        {/* Add PopupModal here */}
        <PopupModal
          isVisible={isModalVisible}
          data={modalData}
          onClose={toggleModal}
        />
      </ModalContext.Provider>
    </LocationProvider>
  );
}
