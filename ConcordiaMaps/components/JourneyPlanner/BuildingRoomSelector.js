import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import PropTypes from "prop-types";
import styles from "../../styles/JourneyPlanner/JourneyPlannerScreenStyles";

const BuildingRoomSelector = ({
  buildings,
  selectedBuilding,
  setSelectedBuilding,
  selectedFloor,
  setSelectedFloor,
  availableFloors,
  selectedRoom,
  setSelectedRoom,
  availableRooms,
  onAddLocation,
}) => {
  return (
    <View>
      <Text style={styles.inputLabel}>Select building:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedBuilding}
          onValueChange={setSelectedBuilding}
          style={styles.picker}
          testID="building-picker"
        >
          <Picker.Item label="Select a building" value="" />
          {buildings.map((building) => (
            <Picker.Item
              key={building.id}
              label={`${building.name} (${building.code})`}
              value={building.id}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.inputLabel}>Select floor:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedFloor}
          onValueChange={setSelectedFloor}
          style={styles.picker}
          enabled={selectedBuilding !== ""}
          testID="floor-picker"
        >
          <Picker.Item label="Select a floor" value="" />
          {availableFloors.map((floor) => (
            <Picker.Item key={floor} label={`Floor ${floor}`} value={floor} />
          ))}
        </Picker>
      </View>

      <Text style={styles.inputLabel}>Select room:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedRoom}
          onValueChange={setSelectedRoom}
          style={styles.picker}
          enabled={selectedBuilding !== "" && selectedFloor !== ""}
          testID="room-picker"
        >
          <Picker.Item label="Select a room" value="" />
          {availableRooms.map((room) => (
            <Picker.Item key={room} label={room} value={room} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddLocation}
        testID="add-building-location-button"
        disabled={!selectedBuilding || !selectedFloor || !selectedRoom}
      >
        <Text style={styles.addButtonText}>Add Location</Text>
      </TouchableOpacity>
    </View>
  );
};

BuildingRoomSelector.propTypes = {
  buildings: PropTypes.array.isRequired,
  selectedBuilding: PropTypes.string.isRequired,
  setSelectedBuilding: PropTypes.func.isRequired,
  selectedFloor: PropTypes.string.isRequired,
  setSelectedFloor: PropTypes.func.isRequired,
  availableFloors: PropTypes.array.isRequired,
  selectedRoom: PropTypes.string.isRequired,
  setSelectedRoom: PropTypes.func.isRequired,
  availableRooms: PropTypes.array.isRequired,
  onAddLocation: PropTypes.func.isRequired,
};

export default BuildingRoomSelector;
