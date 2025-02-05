import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";
import MapView from "react-native-maps";
import NavBar from "../components/NavBar";
import Header from "../components/Header";
import { LocationContext } from "../contexts/LocationContext";

function HomeScreen() {
  const location = useContext(LocationContext);
  return (
    <View style={styles.container}>
      {/* Add Header and NavBar in the HomeScreen */}
      <Header />
      <NavBar /> {/* This is the navigation bar */}
      {/* Map view */}
      <MapView
        style={styles.map}
        region={
          location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }
            : undefined
        }
        showsUserLocation={true}
        loadingEnabled={true}
        watchUserLocation={true}
      ></MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#912338",
  },
  map: {
    flex: 1,
  },
});

export default HomeScreen;
