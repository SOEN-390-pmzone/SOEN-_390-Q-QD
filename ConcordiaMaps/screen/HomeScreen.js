import React, { useContext } from "react";
import { View, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import NavBar from "../components/NavBar";
import Header from "../components/Header";
import { LocationContext } from "../contexts/LocationContext";
import Footer from "../components/Footer";
import styles from "../styles";

const customMarkerImage = require("../assets/PinLogo.png");
import { Building } from "../components/MapMarkers";
import BuildingColoring from "../components/buildingColoring";
import Legend from "../components/Legend";
import ShuttleStop from "../components/ShuttleStop";

function HomeScreen() {
  const location = useContext(LocationContext);
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
