import React, { useState } from "react";
import { View, TouchableOpacity, Text, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import styles from "../styles";
import { Alert } from "react-native";

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useState(new Animated.Value(0))[0];
  const navigation = useNavigation();

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;

    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsOpen(!isOpen)); // Toggle state after animation completes
  };

  const handlePress = (item) => {
    if (item === "Get directions") {
      navigation.navigate("GetDirections");
    } else {
      Alert.alert(`You clicked: ${item}`);
    }
  };

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-270, 0],
  });

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={toggleMenu} style={styles.hamburger}>
        <View style={styles.hamburgerLine}></View>
        <View style={styles.hamburgerLine}></View>
        <View style={styles.hamburgerLine}></View>
      </TouchableOpacity>

      {/* Keep menu in the DOM always */}
      <Animated.View style={[styles.menu, { transform: [{ translateX }] }]}>
        <TouchableOpacity onPress={() => handlePress("Login")}>
          <Text style={styles.menuItem}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePress("Get directions")}>
          <Text style={styles.menuItem}>Get directions</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePress("Switch campuses")}>
          <Text style={styles.menuItem}>Switch campuses</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handlePress("Outdoor Points of Interest")}
        >
          <Text style={styles.menuItem}>Outdoor Points of Interest</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePress("Smart Planner")}>
          <Text style={styles.menuItem}>Smart Planner</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default NavBar;
