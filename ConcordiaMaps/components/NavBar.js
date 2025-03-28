import React, { useState } from "react";
import { View, TouchableOpacity, Text, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types"; // Add this import
import styles from "../styles";
import { Alert } from "react-native";
import ShuttleSchedule from "./ShuttleSchedule";
import { navigationItems } from "../constants/configuration/navigationItems";
function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScheduleVisible, setIsScheduleVisible] = useState(false);
  const animation = useState(new Animated.Value(0))[0];
  const navigation = useNavigation();

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsOpen(!isOpen));
  };

  // Process the menu items and attach the concrete implementations
  const menuItems = navigationItems.map((item) => {
    let action;

    // Determine action based on actionType
    switch (item.actionType) {
      case "navigate":
        action = () => navigation.navigate(item.screen);
        break;
      case "alert":
        action = () => Alert.alert(`You clicked: ${item.label}`);
        break;
      case "custom":
        // Special case for shuttle schedule
        if (item.id === "shuttle") {
          action = () => setIsScheduleVisible(true);
        } else {
          action = () => Alert.alert(`Custom action for: ${item.label}`);
        }
        break;
      default:
        action = () => Alert.alert(`No action defined for: ${item.label}`);
    }

    return {
      ...item,
      action,
    };
  });

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-270, 0],
  });

  const MenuItem = ({ item }) => (
    <TouchableOpacity onPress={item.action} testID={item.testID}>
      <Text style={styles.menuItem}>{item.label}</Text>
    </TouchableOpacity>
  );

  MenuItem.propTypes = {
    item: PropTypes.shape({
      action: PropTypes.func.isRequired,
      testID: PropTypes.string,
      label: PropTypes.string.isRequired,
    }).isRequired,
  };

  return (
    <View style={styles.navbar}>
      <TouchableOpacity
        onPress={toggleMenu}
        style={styles.hamburger}
        testID="hamburger-button"
      >
        <View style={styles.hamburgerLine}></View>
        <View style={styles.hamburgerLine}></View>
        <View style={styles.hamburgerLine}></View>
      </TouchableOpacity>

      <Animated.View style={[styles.menu, { transform: [{ translateX }] }]}>
        {menuItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </Animated.View>

      {/* Shuttle Schedule Popup */}
      <ShuttleSchedule
        visible={isScheduleVisible}
        onClose={() => setIsScheduleVisible(false)}
      />
    </View>
  );
}

export default NavBar;
