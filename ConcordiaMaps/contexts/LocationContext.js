import React, { createContext, useState, useEffect } from "react";
import * as Location from "expo-location";
import { Alert } from "react-native";

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const requestLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need location access to show your position."
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      console.log("Current Location:", currentLocation); // Add this line
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    };

    requestLocation();
  }, []);

  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
};
