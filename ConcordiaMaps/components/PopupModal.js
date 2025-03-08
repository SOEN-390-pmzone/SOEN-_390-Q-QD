import React from "react";
import { Modal, View, Text, TouchableOpacity, Alert } from "react-native";
import PropTypes from "prop-types";
import styles from "../styles/DirectionBox.style";

const PopupModal = ({ isVisible, data, onClose }) => {
  return (
    <Modal
      transparent
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{data.name}</Text>
          <Text style={styles.modalText1}>•••{data.fullBuildingName}•••</Text>
          <Text style={styles.modalText}>{data.address}</Text>

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

          <TouchableOpacity
            style={styles.getDirectionsButton1}
            onPress={() =>
              Alert.alert("Get Inner Directions", "Inner directions pressed")
            }
          >
            <Text style={styles.getDirectionsButtonText}>
              Get in Building Directions
            </Text>
          </TouchableOpacity>
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
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    }),
    address: PropTypes.string,
    fullBuildingName: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

export default PopupModal;
