import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Alert,
} from "react-native";

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleMenu = () => {
    setIsOpen(!isOpen);

    Animated.timing(animation, {
      toValue: isOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handlePress = (item) => {
    Alert.alert(`You clicked: ${item}`);
  };

  const menuHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={toggleMenu} style={styles.hamburger}>
        {/* Hamburger with three lines */}
        <View style={styles.hamburgerLine}></View>
        <View style={styles.hamburgerLine}></View>
        <View style={styles.hamburgerLine}></View>
      </TouchableOpacity>

      {isOpen && (
        <Animated.View style={[styles.menu, { height: menuHeight }]}>
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: "#912338",
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 100,
    position: "absolute",
    top: 60,
    left: 20,
    width: 70,
    height: 50,
  },
  hamburger: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  hamburgerLine: {
    width: 30,
    height: 4,
    backgroundColor: "#fff",
    marginVertical: 4,
  },
  menu: {
    backgroundColor: "#fff",
    position: "absolute",
    top: 57,
    left: 0,
    width: "350",
    borderRadius: 15,
    elevation: 5,
    zIndex: 10,
    overflow: "hidden",
  },
  menuItem: {
    fontSize: 20,
    padding: 8,
    width: "100%",
    color: "333",
    fontWeight: "",
  },
});

export default NavBar;
