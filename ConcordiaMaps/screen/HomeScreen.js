import React, { useContext, useState, useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import NavBar from "../components/NavBar";
import Header from "../components/Header";
import { LocationContext } from "../contexts/LocationContext";
import FloatingSearchBar from "../components/FloatingSearchBar";

function HomeScreen() {
  const location = useContext(LocationContext);
  const [mapRegion, setMapRegion] = useState(null);
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
      mapRef.current?.animateToRegion(region, 1000);
    }, 100);
  };

  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={mapRegion}
        showsUserLocation={true}
        loadingEnabled={true}
        onRegionChangeComplete={(region) => setMapRegion(region)}
      >
        {mapRegion && (
          <Marker
            coordinate={{
              latitude: mapRegion.latitude,
              longitude: mapRegion.longitude,
            }}
            title="Selected Location"
          />
        )}
      </MapView>
      <FloatingSearchBar onPlaceSelect={handlePlaceSelect} />
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