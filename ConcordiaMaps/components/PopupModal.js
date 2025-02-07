import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Modal from "react-native-modal";
import PropTypes from "prop-types";

const PopupModal = ({ isVisible, data, onClose }) => {
  return (
    <View style={styles.modal}>
      {" "}
      {/* Custom style for the modal */}
      <Modal
        isVisible={isVisible}
        onBackdropPress={onClose} // Close modal when tapping outside
        onBackButtonPress={onClose} // Close modal on Android back button
        onModalHide={onClose} // Ensure cleanup after modal hides
        /* Animation properties */
        animationIn="slideInUp" // Animation when modal opens
        animationOut="slideOutDown" // Animation when modal closes
        backdropTransitionOutTiming={0} // Ensure backdrop disappears immediately
        useNativeDriver={true} // Use native driver for better performance
        hideModalContentWhileAnimating={true} // Hide content during animation
      >
        <View style={styles.modalContent}>
          <Text style={styles.popupTitle}>Building Info</Text>
          <Text style={styles.popupText}>Name: {data?.name}</Text>
          <Text style={styles.popupText}>
            Latitude: {data?.coordinate.latitude}
          </Text>
          <Text style={styles.popupText}>
            Longitude: {data?.coordinate.longitude}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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

PopupModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    name: PropTypes.string,
    coordinate: PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    }),
  }),
  onClose: PropTypes.func.isRequired,
};

export default PopupModal;
