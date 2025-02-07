import React, { useState, createContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screen/HomeScreen";
import { LocationProvider } from "./contexts/LocationContext";
import PopupModal from "./components/PopupModal"; // Import the PopupModal
import styles from "./styles";

// Create Context for modal data and visibility
export const ModalContext = createContext();

const Stack = createNativeStackNavigator();

export default function App() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    name: "Sample Location",
    coordinate: { latitude: 51.5074, longitude: -0.1278 },
  });

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <LocationProvider>
      {/* Provide the modal context to all components */}
      <ModalContext.Provider value={{ isModalVisible, modalData, toggleModal }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
              style={styles.container}
              name="Home"
              component={HomeScreen}
            />
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
