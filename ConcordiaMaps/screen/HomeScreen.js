import React from "react";
import { View } from "react-native";
import NavBar from "../components/NavBar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../styles";
import MapMarkers from "../components/MapMarkers";
import BuildingColoring from "../components/buildingColoring";

function HomeScreen() {
  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      {/* Pass BuildingColoring as a child to MapMarkers */}
      <MapMarkers>
        <BuildingColoring />
      </MapMarkers>
      <Footer />
    </View>
  );
}

export default HomeScreen;
