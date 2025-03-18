import React, { useState, createContext, useMemo } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screen/HomeScreen";
import { LocationProvider } from "./contexts/LocationContext";
import PopupModal from "./components/PopupModal";
import styles from "./styles";
import GetDirections from "./components/OutdoorNavigation/GetDirections";

//? SCREENS
import IndoorNavigation from "./components/IndoorNavigation/IndoorNavigation";
import FloorSelector from "./components/IndoorNavigation/FloorSelector";
import BuildingSelector from "./components/IndoorNavigation/BuildingSelector";
import RoomToRoomNavigation from "./components/IndoorNavigation/RoomToRoomNavigation";
import TunnelNavigation from "./components/IndoorNavigation/TunnelNavigation";
import MultistepNavigationScreen from "./components/MultistepNavigation/MultistepNavigationScreen";
import PropTypes from "prop-types";

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
PopupModalWrapper.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
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

  // Memoize the context value
  const modalContextValue = useMemo(
    () => ({ isModalVisible, modalData, toggleModal, setModalData }),
    [isModalVisible, modalData]
  );

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
            <Stack.Screen
              name="BuildingSelector"
              component={BuildingSelector}
            />
            <Stack.Screen name="FloorSelector" component={FloorSelector} />
            <Stack.Screen
              name="IndoorNavigation"
              component={IndoorNavigation}
            />
            <Stack.Screen
              name="RoomToRoomNavigation"
              component={RoomToRoomNavigation}
            />
            <Stack.Screen
              name="TunnelNavigation"
              component={TunnelNavigation}
            />
            <Stack.Screen
              name="MultistepNavigationScreen"
              component={MultistepNavigationScreen}
            />
            <Stack.Screen
              name="MultistepNavigation"
              component={MultistepNavigationScreen}
              options={{
                title: "Navigation",
                headerShown: true,
              }}
            />
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
