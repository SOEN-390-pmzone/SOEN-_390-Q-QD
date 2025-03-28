import React, { useState } from "react";
import { Marker, Callout } from "react-native-maps";
import { Text, View, Image, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import PopupModal from "./PopupModal";

const customMarkerImage = require("../assets/PinLogo.png");

const MapMarkers = ({ markers }) => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupData, setPopupData] = useState(null);

  if (!markers || markers.length === 0) return null;

  const handleMarkerPress = (marker) => {
    setPopupData(marker);
    setPopupVisible(true);
  };

  const closePopup = () => {
    setPopupVisible(false);
    setPopupData(null);
  };

  return (
    <>
      {markers.map((marker) => (
        <Marker
          key={`${marker.name}-${marker.coordinate.latitude}-${marker.coordinate.longitude}`}
          coordinate={marker.coordinate}
          title={marker.name}
          address={marker.address}
          fullBuildingName={marker.fullBuildingName}
          onPress={() => handleMarkerPress(marker)}
        >
          <Image source={customMarkerImage} style={styles.markerImage} />
          <Callout>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutText}>{marker.name}</Text>
              <Text style={styles.calloutText}>{marker.address}</Text>
              <Text style={styles.calloutText}>{marker.fullBuildingName}</Text>
            </View>
          </Callout>
        </Marker>
      ))}

      <PopupModal
        isVisible={popupVisible}
        data={popupData}
        onClose={closePopup}
      />
    </>
  );
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

