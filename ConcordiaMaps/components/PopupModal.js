import React from "react";
import { Modal, View, Text, TouchableOpacity, Alert } from "react-native";
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
  //data = JSON.stringify(data);
  const buildingType = INDOOR_NAVIGATION_BUILDINGS[data.fullBuildingName]; 
  const handleOutdoorsDirectionsSelect = (coordinates) => {
    onClose();
    // Find the corresponding key in the FloorRegistry by matching the building data
    const buildingTypes = Object.keys(FloorRegistry.getAllBuildings());
    const buildingType = buildingTypes.find(
      (key) => FloorRegistry.getBuilding(key).id === buildingId,
    );

    if (buildingType) {
      navigation.navigate("GetDirections", { buildingType });
    }
  };

  const handleFloorSelector = () => {
    onClose(); // Close the modal first

    navigation.navigate("FloorSelector", {
      buildingName: data?.name,
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
              onPress={() =>
                Alert.alert("Get Directions", "Directions pressed")
              }
            >
              <Text style={styles.getDirectionsButtonText}>Get Directions</Text>
            </TouchableOpacity>

            {hasIndoorNavigation && (
              <TouchableOpacity
                style={styles.getDirectionsButton}
                onPress={handleFloorSelector() }
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
              onPress={ handleFloorSelector}
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
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
};

export default PopupModal;
