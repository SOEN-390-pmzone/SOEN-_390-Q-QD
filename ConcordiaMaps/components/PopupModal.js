import React from "react";
import { Modal, View, Text, TouchableOpacity, Alert } from "react-native";
import PropTypes from "prop-types";
import styles from "../styles/DirectionBox.style";

// Building to floor selector mapping
const INDOOR_NAVIGATION_BUILDINGS = {
  "Henry F. Hall": "HallBuilding",
  "John Molson School Of Business": "JMSB",
};

const PopupModal = ({ isVisible, data, onClose, navigation }) => {
  const handleFloorSelector = () => {
    onClose(); // Close the modal first
    const buildingType = INDOOR_NAVIGATION_BUILDINGS[data.name];
    navigation.navigate("FloorSelector", {
      buildingName: data.name,
      buildingType: buildingType,
    });
  };

  // Check if the building has indoor navigation available
  const hasIndoorNavigation = data && data.name in INDOOR_NAVIGATION_BUILDINGS;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{data?.name}</Text>
          <Text style={styles.modalText1}>•••{data?.fullBuildingName}•••</Text>
          <Text style={styles.modalText}>{data?.address}</Text>

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

            {hasIndoorNavigation && (
              <TouchableOpacity
                style={styles.getDirectionsButton}
                onPress={handleFloorSelector}
              >
                <Text style={styles.getDirectionsButtonText}>
                  Floor Selector
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {[
            "H Building",
            "JMSB",
            "Vanier Library",
            "Central Building",
            "Vanier Extension",
          ].includes(data?.name) && (
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
          )}
        </View>
      </View>
    </Modal>
  );
};

PopupModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    fullBuildingName: PropTypes.string,
    address: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
};

export default PopupModal;
