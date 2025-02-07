import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import PropTypes from "prop-types";

const PopupModal = ({ isVisible, data, onClose }) => {
 

  const displayData = data; // Use defaultData if no data is provided

  // Function to handle "Get Directions" press
  const handleGetDirections = () => {
    Alert.alert("Get Directions", "Get Directions pressed");
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{displayData.name}</Text>

          {/* Buttons row */}
          <View style={styles.buttonsContainer}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>

            {/* Get Directions Button */}
            <TouchableOpacity
              style={styles.getDirectionsButton}
              onPress={handleGetDirections}
            >
              <Text style={styles.getDirectionsButtonText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

PopupModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    coordinate: PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
    }).isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 330,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: "row", // Align buttons horizontally
    justifyContent: "center", // Center buttons
    width: "100%",
  },
  closeButton: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "black",
    marginTop:10,
    marginRight: 5, // Space between buttons
  },
  closeButtonText: {
    color: "black",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  getDirectionsButton: {
    backgroundColor: "#990033", // Concordia red
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop:10,
    marginLeft: 5, // Space between buttons
  },
  getDirectionsButtonText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
});

export default PopupModal;
