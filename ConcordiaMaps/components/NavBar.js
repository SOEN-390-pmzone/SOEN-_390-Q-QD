import React, { useState } from "react";
import { View, TouchableOpacity, Text, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import styles from "../styles";
import { Alert } from "react-native";
import ShuttleSchedule from "./ShuttleSchedule";
import analytics from "@react-native-firebase/analytics"; // Import Firebase Analytics

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScheduleVisible, setIsScheduleVisible] = useState(false); // Added missing state
  const animation = useState(new Animated.Value(0))[0];
  const navigation = useNavigation();

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(!isOpen);
      // Log the menu toggle event
      analytics().logEvent("menu_toggle", {
        is_open: !isOpen,
      });
    });
  };

  const handlePress = (item) => {
    if (item === "Get directions") {
      navigation.navigate("GetDirections");
    } else {
      Alert.alert(`You clicked: ${item}`);
    }

    // Log click event for each menu item
    analytics().logEvent("menu_item_click", {
      item_name: item,
    });
  };

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-270, 0],
  });

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
        <TouchableOpacity onPress={() => handlePress("Login")}>
          <Text style={styles.menuItem}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePress("Get directions")}>
          <Text style={styles.menuItem}>Get directions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handlePress("Outdoor Points of Interest")}
        >
          <Text style={styles.menuItem}>Outdoor Points of Interest</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePress("Smart Planner")}>
          <Text style={styles.menuItem}>Smart Planner</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsScheduleVisible(true)}
          testID="shuttle-schedule-modal"
        >
          <Text style={styles.menuItem}>Shuttle Schedule</Text>
        </TouchableOpacity>
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
