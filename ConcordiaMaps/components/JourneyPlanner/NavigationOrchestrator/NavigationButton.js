import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import PropTypes from "prop-types";

const NavigationButton = ({
  onPress,
  style,
  hasTunnel = false,
  avoidOutdoor = false,
}) => {
  // Only show subway icon when both conditions are true
  const showTunnelIcon = hasTunnel && avoidOutdoor;

  // Extract the nested ternary into a function that determines button text
  const getButtonText = () => {
    if (showTunnelIcon) {
      return "Use Tunnel";
    } else if (avoidOutdoor) {
      return "Indoor Path";
    } else {
      return "Get Directions";
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.directionButton,
        showTunnelIcon && styles.tunnelButton,
        style,
      ]}
      onPress={onPress}
      testID={showTunnelIcon ? "tunnelButton" : "directionButton"}
    >
      <MaterialIcons
        name={showTunnelIcon ? "subway" : "directions"}
        size={24}
        color="#fff"
      />
      <Text style={styles.directionButtonText}>{getButtonText()}</Text>
    </TouchableOpacity>
  );
};

NavigationButton.propTypes = {
  onPress: PropTypes.func.isRequired,
  style: PropTypes.object,
  hasTunnel: PropTypes.bool,
  avoidOutdoor: PropTypes.bool,
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
