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
import { getByTestId } from "@testing-library/react";

function Header() {
  const navigation = useNavigation();
  const handlePress = (item) => {
      navigation.navigate("Home");
  };
  return (
    <SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity testID="logoButton" onPress={() => handlePress("Home") }>
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
