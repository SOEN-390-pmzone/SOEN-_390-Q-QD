import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  Alert,
  TouchableOpacity,
} from "react-native";
import styles from "../styles";
import { useNavigation } from "@react-navigation/native";

function Header() {
  const navigation = useNavigation();
  const handlePress = (item) => {
    if (item === "Home") {
      navigation.navigate("Home");
    } else {
      Alert.alert(`You clicked: ${item}`);
    }
  };
  return (
    <SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handlePress("Home")}>
          <Image
            source={require("../assets/ConcordiaLogo.png")}
            style={styles.logo}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>ConcordiaMaps</Text>
      </View>
    </SafeAreaView>
  );
}

export default Header;
