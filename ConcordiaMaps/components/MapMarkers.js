<<<<<<< Updated upstream
import React from "react";
import { Marker, Callout } from "react-native-maps";
import { Text, View, Image, StyleSheet } from "react-native";
import PropTypes from "prop-types";

const customMarkerImage = require("../assets/PinLogo.png");

const MapMarkers = ({ markers }) => {
  if (!markers || markers.length === 0) return null;

  return markers.map((marker, index) => (
    <Marker key={index} coordinate={marker.coordinate} title={marker.name}>
      <Image source={customMarkerImage} style={styles.markerImage} />
      <Callout>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutText}>{marker.name}</Text>
        </View>
      </Callout>
    </Marker>
  ));
};

const styles = StyleSheet.create({
  markerImage: {
    width: 40,
    height: 40,
  },
  // Style for the Callout container
  calloutContainer: {
    width: 150,
    height: 60,
    padding: 5,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  // Style for the text inside the Callout
  calloutText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
});

MapMarkers.propTypes = {
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      coordinate: PropTypes.shape({
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
      }).isRequired,
      name: PropTypes.string.isRequired,
    }),
  ),
};

export default MapMarkers;
