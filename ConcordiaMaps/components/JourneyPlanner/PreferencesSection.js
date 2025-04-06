import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PropTypes from "prop-types";
import styles from "../../styles/JourneyPlanner/JourneyPlannerScreenStyles";

const PreferencesSection = ({ avoidOutdoor, setAvoidOutdoor }) => {
  return (
    <View style={styles.preferencesContainer}>
      <Text style={styles.sectionTitle}>Preferences</Text>
      <TouchableOpacity
        style={styles.preferenceRow}
        onPress={() => setAvoidOutdoor(!avoidOutdoor)}
        testID="toggle-indoor-preference"
      >
        <Text style={styles.preferenceText}>
          Prefer indoor paths (tunnels/bridges)
        </Text>
        <View style={[styles.checkbox, avoidOutdoor && styles.checkboxChecked]}>
          {avoidOutdoor && (
            <Ionicons name="checkmark" size={18} color="white" />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

PreferencesSection.propTypes = {
  avoidOutdoor: PropTypes.bool.isRequired,
  setAvoidOutdoor: PropTypes.func.isRequired,
};

export default PreferencesSection;
