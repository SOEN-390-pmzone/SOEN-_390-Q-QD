import React, { useState, createContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screen/HomeScreen";
import { LocationProvider } from "./contexts/LocationContext";
import PopupModal from "./components/PopupModal"; // Import the PopupModal
import styles from "./styles";
import GetDirections from "./components/GetDirections";
// import MapMarkers from "./components/MapMarkers"; // Ensure this import exists

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

  return (
    <LocationProvider>
      {/* Provide the modal context to all components */}
      <ModalContext.Provider
        value={{ isModalVisible, modalData, toggleModal, setModalData }}
      >
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
