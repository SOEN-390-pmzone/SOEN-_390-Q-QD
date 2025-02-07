import React, { useState } from "react";
import { Marker, Callout } from "react-native-maps";
import { Text, View, Image, StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal"; // Import the modal library
import PropTypes from "prop-types";

const customMarkerImage = require("../assets/PinLogo.png");

const MapMarkers = ({ markers }) => {
  if (!markers || markers.length === 0) return null;

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupData, setPopupData] = useState(null);

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
      {markers.map((marker, index) => (
        <Marker
          key={index}
          coordinate={marker.coordinate}
          title={marker.name}
          onPress={() => handleMarkerPress(marker)}
        >
          <Image source={customMarkerImage} style={styles.markerImage} />
          <Callout>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutText}>{marker.name}</Text>
            </View>
          </Callout>
        </Marker>
      ))}

      {/* Use react-native-modal for Popup */}
      <Modal
        isVisible={popupVisible}
        onBackdropPress={closePopup} // Close modal when tapping outside
        onBackButtonPress={closePopup} // Close modal on Android back button
        animationIn="slideInUp" // Animation when modal opens
        animationOut="slideOutDown" // Animation when modal closes
        backdropTransitionOutTiming={0} // Ensure backdrop disappears immediately
        useNativeDriver={true} // Use native driver for better performance
        hideModalContentWhileAnimating={true} // Hide content during animation
        style={styles.modal} // Custom style for the modal
        onModalHide={closePopup} // Ensure cleanup after modal hides
      >
        <View style={styles.modalContent}>
          <Text style={styles.popupTitle}>Building Info</Text>
          <Text style={styles.popupText}>Name: {popupData?.name}</Text>
          <Text style={styles.popupText}>Latitude: {popupData?.coordinate.latitude}</Text>
          <Text style={styles.popupText}>Longitude: {popupData?.coordinate.longitude}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={closePopup}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  modal: {
    margin: 0, // Remove default margin
    justifyContent: "flex-end", // Align modal to the bottom
    backgroundColor: "rgba(255, 0, 0, 0.3)", // Temporary background color for debugging
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: "center",
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  popupText: {
    fontSize: 14,
    marginBottom: 5,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 14,
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
    })
  ),
};

export default MapMarkers;