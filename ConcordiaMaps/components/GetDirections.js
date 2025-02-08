import React, { useState } from "react";
import { View, Button } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import FloatingSearchBar from "./FloatingSearchBar";
import Header from "./Header";
import Footer from "./Footer";
import NavBar from "./NavBar";
import styles from "../styles";

const GetDirections = () => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState([]);
  const [isOriginSearch, setIsOriginSearch] = useState(true);

  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      <View style={styles.searchContainer}>
        <FloatingSearchBar
          onPlaceSelect={(location) => {
            if (isOriginSearch) {
              setOrigin(location);
              setIsOriginSearch(false);
            } else {
              setDestination(location);
            }
          }}
          placeholder={isOriginSearch ? "Enter Origin" : "Enter Destination"}
          style={styles.searchBar}
        />
        <FloatingSearchBar
          onPlaceSelect={(location) => {
            setDestination(location);
          }}
          placeholder="Enter Destination"
          style={[styles.searchBar, { marginTop: 10 }]}
        />
        <View style={styles.buttonContainer}>
          <Button title="Get Directions" onPress={() => setRoute([])} />
        </View>
      </View>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 45.4973, // Default center (SGW campus)
          longitude: -73.5789,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {origin && <Marker coordinate={origin} title="Origin" />}
        {destination && <Marker coordinate={destination} title="Destination" />}
        {route.length > 0 && (
          <Polyline coordinates={route} strokeWidth={4} strokeColor="blue" />
        )}
      </MapView>
      <Footer />
    </View>
  );
};

export default GetDirections;
