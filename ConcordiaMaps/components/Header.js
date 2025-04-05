import React, { useState } from "react";
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
import HamburgerButton from "../components/HamburgerButton";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));
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

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <HamburgerButton onPress={toggleMenu} />

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
    </SafeAreaView>
  );
}

export default Header;
