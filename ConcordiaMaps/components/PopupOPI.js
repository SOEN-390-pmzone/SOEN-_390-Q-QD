import React from "react";
import { Modal, View, Text, TouchableOpacity, Alert } from "react-native";
import PropTypes from "prop-types";
import styles from "../styles/DirectionBox.style"; // Use the same styles as the building popup

const PopupOPI = ({ isVisible, data = {}, onClose }) => {
  const { name = "Cafe/Restaurant Name", address = "Address not available" } =
    data;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{name}</Text>
          <Text style={styles.modalText}>{address}</Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.getDirectionsButton}
              onPress={() =>
                Alert.alert("Get Directions", "Directions pressed")
              }
            >
              <Text style={styles.getDirectionsButtonText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

PopupOPI.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    address: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PopupOPI;
