import React from "react";
import { Text, TouchableOpacity, Image, ScrollView, View } from "react-native";
import PropTypes from "prop-types";
import styles from "../styles/DirectionBox.style";

const HallBuildingFloors = ({ onClose }) => {
  const hallFloors = [
    {
      id: 9,
      image: require("../assets/hall_floor_8_9.png"),
      label: "Hall Floor 9",
    },
    {
      id: 8,
      image: require("../assets/hall_floor_8_9.png"),
      label: "Hall Floor 8",
    },
    {
      id: 2,
      image: require("../assets/hall_floor_2.png"),
      label: "Hall Floor 2",
    },
    {
      id: 1,
      image: require("../assets/hall_floor_1.png"),
      label: "Hall Floor 1",
    },
    { id: 0, image: require("../assets/tunnel.png"), label: "Tunnel" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.modalTitle}>Select a Floor</Text>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {hallFloors.map((floor) => (
          <TouchableOpacity
            key={floor.id}
            style={styles.floorItem}
            onPress={() => console.log(`Navigating to ${floor.label}`)}
          >
            <Image source={floor.image} style={styles.floorImage} />
            <View style={styles.overlay}>
              <Text style={styles.floorText}>{floor.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

HallBuildingFloors.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default HallBuildingFloors;
