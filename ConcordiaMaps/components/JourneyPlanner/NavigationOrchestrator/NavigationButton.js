import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import PropTypes from 'prop-types';

const NavigationButton = ({ 
  onPress, 
  style, 
  hasTunnel = false, 
  avoidOutdoor = false 
}) => {
  return (
    <TouchableOpacity
      style={[styles.directionButton, hasTunnel && styles.tunnelButton, style]}
      onPress={onPress}
      testID={hasTunnel ? "tunnelButton" : "directionButton"}
    >
      <MaterialIcons 
        name={hasTunnel ? "subway" : "directions"} 
        size={24} 
        color="#fff" 
      />
      <Text style={styles.directionButtonText}>
        {hasTunnel ? "Use Tunnel" : avoidOutdoor ? "Indoor Path" : "Get Directions"}
      </Text>
    </TouchableOpacity>
  );
};


NavigationButton.propTypes = {
  onPress: PropTypes.func.isRequired,
  style: PropTypes.object,
  hasTunnel: PropTypes.bool,
  avoidOutdoor: PropTypes.bool
};

const styles = StyleSheet.create({
  directionButton: {
    flexDirection: "row",
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "center",
    marginVertical: 8,
  },
  tunnelButton: {
    backgroundColor: "#673AB7", // Purple for tunnel connections
  },
  directionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
});

export default NavigationButton;