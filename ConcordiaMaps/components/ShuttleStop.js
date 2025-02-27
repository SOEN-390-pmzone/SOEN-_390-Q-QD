import React from "react";
import { Marker, Callout } from "react-native-maps";
import { Text, View, Image, StyleSheet } from "react-native";

const customMarkerImage = require("../assets/Shuttle.png");

// Bus stop coordinates from Google Maps
const busStops = [
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
  return busStops.map((marker, index) => (
    <Marker
      key={index}
      coordinate={marker.coordinate}
      title={marker.name}
      testID={`shuttle-stop-marker-${index}`}
    >
      <Image source={customMarkerImage} style={styles.markerImage} />
      <Callout>
        <View style={styles.calloutContainer}>
          <Text>{marker.name}</Text>
        </View>
      </Callout>
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
