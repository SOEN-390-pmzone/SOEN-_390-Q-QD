import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PropTypes from "prop-types";
import styles from "../../styles/JourneyPlanner/JourneyPlannerScreenStyles";

const LocationsList = ({ tasks, onMoveUp, onMoveDown, onRemove }) => {
  if (tasks.length === 0) {
    return (
      <Text style={styles.emptyText}>
        No locations added yet. Add at least two locations to create a journey.
      </Text>
    );
  }

  return (
    <View style={styles.taskList}>
      {tasks.map((item, index) => (
        <View
          key={item.id}
          style={styles.taskItem}
          testID={`location-item-${index}`}
        >
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskDescription}>
              {item.buildingId
                ? `${item.buildingId}, Room ${item.room}`
                : `Outdoor location`}
            </Text>
          </View>
          <View style={styles.taskActions}>
            <TouchableOpacity
              onPress={() => onMoveUp(index)}
              style={styles.actionButton}
              testID={`move-up-${index}`}
            >
              <Ionicons name="arrow-up" size={24} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onMoveDown(index)}
              style={styles.actionButton}
              testID={`move-down-${index}`}
            >
              <Ionicons name="arrow-down" size={24} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onRemove(item.id)}
              style={styles.actionButton}
              testID={`remove-${index}`}
            >
              <Ionicons name="trash-outline" size={24} color="#ff3b30" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};

LocationsList.propTypes = {
  tasks: PropTypes.array.isRequired,
  onMoveUp: PropTypes.func.isRequired,
  onMoveDown: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default LocationsList;
