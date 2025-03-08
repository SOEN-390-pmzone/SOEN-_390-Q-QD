import React from "react";
import { Marker } from "react-native-maps";
import { Image, StyleSheet } from "react-native";

const customMarkerImage = require("../assets/Shuttle.png");

// Bus stop coordinates from Google Maps
export const busStops = [
  {
    name: "SGW Stop",
    coordinate: { latitude: 45.497135674356734, longitude: -73.57851252460765 },
  },
  {
    name: "Loyola Stop",
    coordinate: { latitude: 45.458292913285604, longitude: -73.63900517492607 },
  },
];

const ShuttleStop = () => {
  return busStops.map((stop) => (
    <Marker
      key={stop.name} // Using the stop name as a unique key instead of index
      coordinate={stop.coordinate}
      title={stop.name}
      testID={`shuttle-stop-marker-${stop.name.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <Image source={customMarkerImage} style={styles.markerImage} />
    </Marker>
  ));
};

const styles = StyleSheet.create({
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  calloutContainer: {
    width: 140,
    height: 25,
    padding: 5,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  calloutText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
});

export default ShuttleStop;
