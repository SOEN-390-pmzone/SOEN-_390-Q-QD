import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import styles from "../styles";
import { useNavigation } from "@react-navigation/native";

function Header() {
  const navigation = useNavigation();
  const handlePress = () => {
    navigation.navigate("Home");
  };
  const handleCalendarPress = () => {
    navigation.navigate("Calendar");
  };
  return (
    <SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity testID="logoButton" onPress={() => handlePress()}>
          <Image
            source={require("../assets/ConcordiaLogo.png")}
            style={styles.logo}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>ConcordiaMaps</Text>
        <TouchableOpacity
          testID="calendarButton"
          onPress={() => handleCalendarPress()}
        >
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
