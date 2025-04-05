import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screen/HomeScreen";
import { LocationProvider } from "./contexts/LocationContext";
import styles from "./styles";
import GetDirections from "./components/GetDirections";

import IndoorNavigation from "./components/IndoorNavigation/IndoorNavigation";
import FloorSelector from "./components/IndoorNavigation/FloorSelector";
import BuildingSelector from "./components/IndoorNavigation/BuildingSelector";
import TunnelNavigation from "./components/IndoorNavigation/TunnelNavigation";
import CalendarScreen from "./components/CalendarScreen";

// Create Context for modal data and visibility

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <LocationProvider>
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
          <Stack.Screen name="TunnelNavigation" component={TunnelNavigation} />

          <Stack.Screen name="Calendar" component={CalendarScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </LocationProvider>
  );
}
