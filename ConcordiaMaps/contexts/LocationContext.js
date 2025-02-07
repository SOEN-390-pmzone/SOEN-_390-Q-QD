import React, { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
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
          "We need location access to show your position.",
        );
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      setLocation(coords);
    };

    requestLocation();
  }, []);

  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
};

LocationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
