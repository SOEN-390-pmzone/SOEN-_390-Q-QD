import React from "react";
import { View } from "react-native";
import MapView from "react-native-maps";
import NavBar from "../components/NavBar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../styles";
import ShuttleStop from "../components/ShuttleStop";

function HomeScreen() {
  return (
    <View style={styles.container}>
    <Header />
    <NavBar />
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
          : {
              latitude: 45.4973, // Default center (SGW campus)
              longitude: -73.5789,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }
      }
      showsUserLocation={true}
      loadingEnabled={true}
      watchUserLocation={true}
    >
      {Building.map((building, index) => (
        <Marker
          key={index}
          coordinate={building.coordinate}
          title={building.name}
        >
          <Image
            source={customMarkerImage}
            style={styles.customMarkerImage}
          />
        </Marker>
      ))}
      <BuildingColoring />
      <ShuttleStop />
    </MapView>
    <Legend />

    <Footer />
  </View>
  );
}
export default HomeScreen;
