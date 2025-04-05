import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import styles from "../styles";
import { useNavigation } from "@react-navigation/native";
import NavBar from "../components/NavBar";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsOpen(!isOpen));
  };

  const handlePress = () => {
    navigation.navigate("Home");
  };

  const handleCalendarPress = () => {
    navigation.navigate("Calendar");
  };

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-270, 0],
  });

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity
          testID="hamburger-button"
          onPress={toggleMenu}
          style={styles.hamburger}
        >
          <View style={styles.hamburgerLine}></View>
          <View style={styles.hamburgerLine}></View>
          <View style={styles.hamburgerLine}></View>
        </TouchableOpacity>

        <TouchableOpacity testID="logoButton" onPress={handlePress}>
          <Image
            source={require("../assets/ConcordiaLogo.png")}
            style={styles.logo}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>ConcordiaMaps</Text>
        <TouchableOpacity testID="calendarButton" onPress={handleCalendarPress}>
          <Image
            source={require("../assets/calendarIcon.png")}
            style={styles.calendarIcon}
          />
        </TouchableOpacity>
      </View>
      <Animated.View style={[styles.menu, { transform: [{ translateX }] }]}>
        <NavBar />
      </Animated.View>
    </SafeAreaView>
  );
}

export default Header;
