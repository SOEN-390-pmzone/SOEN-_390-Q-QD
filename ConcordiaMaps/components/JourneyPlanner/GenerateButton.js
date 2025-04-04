import React from "react";
import { TouchableOpacity, Text } from "react-native";
import PropTypes from "prop-types";
import styles from "../../styles/JourneyPlanner/JourneyPlannerScreenStyles";

const GenerateButton = ({ disabled, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.generateButton, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
      testID="generate-route-button"
    >
      <Text style={styles.generateButtonText}>Generate Optimal Route</Text>
    </TouchableOpacity>
  );
};

GenerateButton.propTypes = {
  disabled: PropTypes.bool.isRequired,
  onPress: PropTypes.func.isRequired,
};

export default GenerateButton;
