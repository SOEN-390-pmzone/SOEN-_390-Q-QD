import React from "react";
import { View, Text } from "react-native";
import PropTypes from "prop-types";
import LocationsList from "./LocationsList";
import styles from "../../styles/JourneyPlanner/JourneyPlannerScreenStyles";

const LocationsSection = ({ tasks, onMoveUp, onMoveDown, onRemove }) => {
  return (
    <View style={styles.tasksContainer}>
      <Text style={styles.sectionTitle}>Your Locations ({tasks.length})</Text>
      {tasks.length === 0 ? (
        <Text style={styles.emptyText}>
          No locations added yet. Add at least two locations to create a
          journey.
        </Text>
      ) : (
        <LocationsList
          tasks={tasks}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onRemove={onRemove}
        />
      )}
    </View>
  );
};

LocationsSection.propTypes = {
  tasks: PropTypes.array.isRequired,
  onMoveUp: PropTypes.func.isRequired,
  onMoveDown: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default LocationsSection;
