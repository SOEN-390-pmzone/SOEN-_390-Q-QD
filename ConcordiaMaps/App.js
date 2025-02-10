import * as React from "react";
import { StyleSheet } from "react-native";
// import { Text} from 'react-native';

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screen/HomeScreen";
import { LocationProvider } from "./contexts/LocationContext";
import styles from "./styles";
import GetDirections from "./components/GetDirections";

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
        </Stack.Navigator>
      </NavigationContainer>
    </LocationProvider>
  );
}
