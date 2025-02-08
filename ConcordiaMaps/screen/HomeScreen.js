import React, { useContext, useState, useEffect, useRef } from "react";
import { View, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import NavBar from "../components/NavBar";
import Header from "../components/Header";
import { LocationContext } from "../contexts/LocationContext";
import FloatingSearchBar from "../components/FloatingSearchBar";
import Footer from "../components/Footer";
import { Building } from "../components/MapMarkers";
import BuildingColoring from "../components/buildingColoring";
import Legend from "../components/Legend";
import styles from "../styles";

const customMarkerImage = require("../assets/PinLogo.png");
import ShuttleStop from "../components/ShuttleStop";

function HomeScreen() {
  const location = useContext(LocationContext);
  const [mapRegion, setMapRegion] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (location) {
      setMapRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, [location]);

  const handlePlaceSelect = (newRegion) => {
    console.log("handlePlaceSelect called with:", newRegion);
    const region = {
      ...newRegion,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };

    setTimeout(() => {
      setMapRegion(region);
      setSelectedLocation(region);
      mapRef.current?.animateToRegion(region, 1000);
    }, 100);
  };

  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      <FloatingSearchBar onPlaceSelect={handlePlaceSelect} />
      <MapView
        ref={mapRef}
        style={styles.map}
        region={
          mapRegion || {
            latitude: 45.4973, // Default center (SGW campus)
            longitude: -73.5789,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }
        }
        showsUserLocation={true}
        loadingEnabled={true}
        onRegionChangeComplete={(region) => setMapRegion(region)}
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

        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title="Selected Location"
          />
        )}
        <ShuttleStop />
      </MapView>

      <Legend />
      <Footer />
    </View>
  );
}

export default HomeScreen;
