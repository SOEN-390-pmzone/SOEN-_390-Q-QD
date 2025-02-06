import React from "react";
import { Marker, Callout } from "react-native-maps";
import { Text, View, Image, StyleSheet, Alert } from "react-native";
import PropTypes from "prop-types";


const customMarkerImage = require("../assets/PinLogo.png");


const MapMarkers = ({ markers }) => {
  if (!markers || markers.length === 0) return null;


  const handleMarkerPress = (buildingName, latitude, longitude) => {
    // Affiche une alerte avec le nom du bâtiment et ses coordonnées
    Alert.alert(
      "More Info",
      `Building name: ${buildingName}
      \nLatitude: ${latitude}
      \nLongitude: ${longitude}`,
      [
        {
          text: "Close",
          onPress: () => console.log("Alerte pour " + buildingName + " fermée"),
        },
      ],
      { cancelable: true }
    );
  };


  return markers.map((marker, index) => (
    <Marker
      key={index}
      coordinate={marker.coordinate}
      title={marker.name}
      // Affiche l'alerte lors du clic sur un marqueur
      onPress={() => handleMarkerPress(
        marker.name,
        marker.coordinate.latitude,
        marker.coordinate.longitude
      )}
    >
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
  calloutContainer: {
    width: 160,
    height: 50,
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
