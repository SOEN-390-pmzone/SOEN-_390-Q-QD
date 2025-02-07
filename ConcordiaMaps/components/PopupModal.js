import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Modal from "react-native-modal";
import PropTypes from "prop-types";

const PopupModal = ({ isVisible, data, onClose }) => {
  return (
    <View style={styles.modal}>
      <Modal
        isVisible={isVisible}
        onBackdropPress={onClose}
        onBackButtonPress={onClose}
        onModalHide={onClose}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionOutTiming={0}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
      >
        <View style={styles.modalContent}>
          <Text style={styles.popupTitle}>{data?.name}</Text>
          <Text style={styles.popupText}>
            Latitude: {data?.coordinate.latitude}
          </Text>
          <Text style={styles.popupText}>
            Longitude: {data?.coordinate.longitude}
          </Text>

          {/* Buttons Container */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.directionButton} 
              onPress={() => Alert.alert("Direction clicked")}
            >
              <Text style={styles.directionButtonText}>Get Direction</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-end",
    backgroundColor: "rgba(255, 0, 0, 0.3)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  popupText: {
    fontSize: 14,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  closeButton: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "black",
  },
  closeButtonText: {
    color: "black",
    fontSize: 14,
    fontWeight: "bold",
  },
  directionButton: {
    backgroundColor: "#990033",
    padding: 10,
    borderRadius: 10,
    borderColor: "black",
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  directionButtonText: {
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

