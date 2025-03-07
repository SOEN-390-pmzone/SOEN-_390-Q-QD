import React, { useState, createContext } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screen/HomeScreen";
import { LocationProvider } from "./contexts/LocationContext";
import PopupModal from "./components/PopupModal";
import styles from "./styles";
import GetDirections from "./components/GetDirections";
import IndoorNavigation from "./components/IndoorNavigation";
import FloorSelector from "./components/FloorSelector";
import BuildingSelector from "./components/BuildingSelector";
import FloorNavigationSelector from "./components/FloorNavigationSelector";
import TunnelNavigation from "./components/TunnelNavigation";
// import MapMarkers from "./components/MapMarkers"; // Ensure this import exists

// Create Context for modal data and visibility
export const ModalContext = createContext();

const Stack = createNativeStackNavigator();

// Create a wrapper component for PopupModal that has access to navigation
const PopupModalWrapper = ({ isVisible, data, onClose }) => {
  const navigation = useNavigation();
  return (
    <PopupModal
      isVisible={isVisible}
      data={data}
      onClose={onClose}
      navigation={navigation}
    />
  );
};

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
            <Stack.Screen name="BuildingSelector" component={BuildingSelector} />
            <Stack.Screen name="FloorSelector" component={FloorSelector} />
            <Stack.Screen name="IndoorNavigation" component={IndoorNavigation} />
            <Stack.Screen name="FloorNavigationSelector" component={FloorNavigationSelector} />
            <Stack.Screen name="TunnelNavigation" component={TunnelNavigation} />
          </Stack.Navigator>

          <PopupModalWrapper
            isVisible={isModalVisible}
            data={modalData}
            onClose={toggleModal}
          />
        </NavigationContainer>
      </ModalContext.Provider>
    </LocationProvider>
  );
}
