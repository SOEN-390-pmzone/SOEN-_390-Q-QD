import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import styles from "../styles/DirectionBox.style";

// Building to floor selector mapping
const INDOOR_NAVIGATION_BUILDINGS = {
  "Henry F. Hall Building": "HallBuilding",
  "John Molson School of Business Building": "JMSB",
  "Vanier Library Extension": "VanierExtension",
  "Engineering and Visual Arts Building": "EVBuilding",
  "Webster Library": "Library",
  "Vanier Library": "VanierLibrary",
};

const PopupModal = ({ isVisible, data, onClose, navigation }) => {
  const buildingType = INDOOR_NAVIGATION_BUILDINGS[data.fullBuildingName];

  const handleOutdoorsDirectionsSelect = () => {
    onClose();

    navigation.navigate("GetDirections", {
      latitude: data.coordinate.latitude,
      longitude: data.coordinate.longitude,
      fromPopup: true,
    });
  };

  const handleFloorSelector = () => {
    onClose(); // Close the modal first

    navigation.navigate("FloorSelector", {
      //buildingName: data?.name,
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
          <Text style={styles.modalText1}>{data?.fullBuildingName}</Text>
          <Text style={styles.modalText}>{data?.address}</Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.getDirectionsButton}
              onPress={() => handleOutdoorsDirectionsSelect()}
              //
            >
              <Text style={styles.getDirectionsButtonText}>Get Directions</Text>
            </TouchableOpacity>

            {hasIndoorNavigation && (
              <TouchableOpacity style={styles.getDirectionsButton}>
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
              onPress={handleFloorSelector}
            >
              <Text style={styles.getDirectionsButtonText}>
                Get Indoor Directions
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
    coordinate: PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    }),
  }).isRequired,

  onClose: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
};

export default PopupModal;

PopupModal.propTypes = {
  isVisible: PropTypes.bool.isRequired, // Whether the modal is visible
  data: PropTypes.shape({
    name: PropTypes.string.isRequired, // The name of the building
    fullBuildingName: PropTypes.string, // The full name of the building (optional)
    address: PropTypes.string, // The address of the building (optional)
    coordinate: PropTypes.shape({
      latitude: PropTypes.number, // Latitude of the building's location
      longitude: PropTypes.number, // Longitude of the building's location
    }),
  }).isRequired, // The data object is required
  onClose: PropTypes.func.isRequired, // Function to handle closing the modal
  navigation: PropTypes.object.isRequired, // Navigation object for navigation actions
};