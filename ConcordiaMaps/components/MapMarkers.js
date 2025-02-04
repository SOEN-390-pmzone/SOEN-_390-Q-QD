import React from "react";
import { View, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import styles from "../styles";

const customMarkerImage = require("../assets/PinLogo.png");

export const Building = [
  // SGW Campus buildings
  {
    name: "Webster Library",
    coordinate: { latitude: 45.4968158, longitude: -73.5779337 },
  },
  {
    name: "B Annex",
    coordinate: { latitude: 45.49791, longitude: -73.579441 },
  },
  {
    name: "CL Annex",
    coordinate: { latitude: 45.494228, longitude: -73.579299 },
  },
  {
    name: "CI Annex",
    coordinate: { latitude: 45.497438, longitude: -73.579946 },
  },
  {
    name: "D Annex",
    coordinate: { latitude: 45.497834, longitude: -73.579282 },
  },
  {
    name: "EN Annex",
    coordinate: { latitude: 45.496864, longitude: -73.579561 },
  },
  {
    name: "ER Building",
    coordinate: { latitude: 45.496362, longitude: -73.580212 },
  },
  {
    name: "EV Building",
    coordinate: { latitude: 45.495538, longitude: -73.577779 },
  },
  {
    name: "Henry F. Hall",
    coordinate: { latitude: 45.4973129, longitude: -73.578876 },
  },
  {
    name: "John Molson School Of Business",
    coordinate: { latitude: 45.495309, longitude: -73.579023 },
  },
  {
    name: "Visual Art Building",
    coordinate: { latitude: 45.495525, longitude: -73.573794 },
  },

  // Loyola Campus buildings
  {
    name: "Administration Building",
    coordinate: { latitude: 45.457772, longitude: -73.639901 },
  },
  {
    name: "BB Annex",
    coordinate: { latitude: 45.459849, longitude: -73.639339 },
  },
  {
    name: "Central Building",
    coordinate: { latitude: 45.458271, longitude: -73.64045 },
  },
  {
    name: "Stinger Dome",
    coordinate: { latitude: 45.457045, longitude: -73.638223 },
  },
  {
    name: "Vanier Library",
    coordinate: { latitude: 45.459058, longitude: -73.638458 },
  },
];

const MapMarkers = () => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 45.4973, // Centering around SGW campus
          longitude: -73.5789,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
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
      </MapView>
    </View>
  );
};

export default MapMarkers;
