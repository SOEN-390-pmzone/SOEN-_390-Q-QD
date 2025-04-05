import React from "react";
import { TouchableOpacity, View } from "react-native";
import PropTypes from "prop-types";
import styles from "../styles";

/**
 * A reusable hamburger menu button component
 * @param {function} onPress - Function to call when the hamburger button is pressed
 * @param {object} style - Additional styles to apply to the hamburger button container
 */
const HamburgerButton = ({ onPress, style }) => {
  return (
    <TouchableOpacity
      testID="hamburger-button"
      onPress={onPress}
      style={[styles.hamburger, style]}
      accessible={true}
      accessibilityLabel="Menu"
      accessibilityHint="Opens the navigation menu"
      accessibilityRole="button"
    >
      <View style={styles.hamburgerLine}></View>
      <View style={styles.hamburgerLine}></View>
      <View style={styles.hamburgerLine}></View>
    </TouchableOpacity>
  );
};

// Add prop types validation
HamburgerButton.propTypes = {
  onPress: PropTypes.func.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

// Add default props
HamburgerButton.defaultProps = {
  style: null,
};

export default HamburgerButton;
