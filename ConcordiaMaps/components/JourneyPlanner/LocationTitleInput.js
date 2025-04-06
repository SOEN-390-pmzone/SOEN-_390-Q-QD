import React from "react";
import { TextInput } from "react-native";
import PropTypes from "prop-types";
import styles from "../../styles/JourneyPlanner/JourneyPlannerScreenStyles";

const LocationTitleInput = ({ taskTitle, setTaskTitle }) => {
  return (
    <TextInput
      style={styles.textInput}
      placeholder="Location Title"
      value={taskTitle}
      onChangeText={setTaskTitle}
      testID="location-title-input"
    />
  );
};

LocationTitleInput.propTypes = {
  taskTitle: PropTypes.string.isRequired,
  setTaskTitle: PropTypes.func.isRequired,
};

export default LocationTitleInput;
