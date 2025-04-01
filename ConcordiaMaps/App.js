import React, { useState, createContext, useMemo, useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Sentry from '@sentry/react-native';

// Initialize Sentry first, before any other code
Sentry.init({
  dsn: 'https://d2de066f1c8d69b21d6ac3fbcdcf55c6@o4509035878023168.ingest.de.sentry.io/4509047451025488',
  tracesSampleRate: 1.0,
  enableAutoPerformanceTracing: true,
  enableNativeFramesTracking: true,
  enableStallTracking: true,
  enableNative: true,
  enableUserInteractionTracing: true,
});

// Import screens and components
import HomeScreen from "./screen/HomeScreen";
import { LocationProvider } from "./contexts/LocationContext";
import PopupModal from "./components/PopupModal";
import styles from "./styles";
import GetDirections from "./components/GetDirections";
import IndoorNavigation from "./components/IndoorNavigation/IndoorNavigation";
import FloorSelector from "./components/IndoorNavigation/FloorSelector";
import BuildingSelector from "./components/IndoorNavigation/BuildingSelector";
import RoomToRoomNavigation from "./components/IndoorNavigation/RoomToRoomNavigation";
import TunnelNavigation from "./components/IndoorNavigation/TunnelNavigation";
import CalendarScreen from "./components/CalendarScreen";
import PropTypes from "prop-types";

// Create Context for modal data and visibility
export const ModalContext = createContext();

const Stack = createNativeStackNavigator();

// Create a wrapper component for PopupModal that has access to navigation
const PopupModalWrapper = ({ isVisible, data, onClose }) => {
  const navigation = useRef(null);
  return (
    <PopupModal
      isVisible={isVisible}
      data={data}
      onClose={onClose}
      navigation={navigation.current}
    />
  );
};

PopupModalWrapper.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  data: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

function App() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    name: "",
    coordinate: { latitude: 0, longitude: 0 },
  });
  const navigationRef = useRef(null);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  // Memoize the context value
  const modalContextValue = useMemo(
    () => ({ isModalVisible, modalData, toggleModal, setModalData }),
    [isModalVisible, modalData],
  );

  useEffect(() => {
    // Safely try to track app startup using new API
    try {
      Sentry.startSpan(
        {
          name: 'app.start',
          op: 'app.lifecycle'
        }, 
        () => {
          // App startup logic can go here
        }
      );
    } catch (error) {
      console.log("Sentry performance monitoring not available:", error);
    }
  }, []);

  // Create the routing instrumentation after NavigationContainer renders
  useEffect(() => {
    if (navigationRef.current) {
      try {
        // Only set up if ReactNavigationInstrumentation exists
        if (Sentry.ReactNavigationInstrumentation) {
          const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();
          routingInstrumentation.registerNavigationContainer(navigationRef.current);
          
          // Add the integration if available using the new pattern
          if (Sentry.ReactNativeTracing) {
            Sentry.startSpan(
              {
                name: 'navigation.initialize',
                op: 'navigation'
              },
              () => {
                const integration = new Sentry.ReactNativeTracing({
                  routingInstrumentation,
                  idleTimeout: 2000,
                });
                
                const client = Sentry.getCurrentHub().getClient();
                if (client && client.addIntegration) {
                  client.addIntegration(integration);
                }
              }
            );
          }
        }
      } catch (error) {
        console.log("Navigation instrumentation not available:", error);
      }
    }
  }, [navigationRef.current]);

  return (
    <LocationProvider>
      <ModalContext.Provider value={modalContextValue}>
        <NavigationContainer ref={navigationRef}>
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
            <Stack.Screen name="Calendar" component={CalendarScreen} />
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

// Wrap App with Sentry after defining it
export default Sentry.wrap(App);