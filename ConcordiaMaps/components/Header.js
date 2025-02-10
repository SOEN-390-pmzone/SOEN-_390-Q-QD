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

const styles = StyleSheet.create({
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#912338",
    padding: 10,
    position: "relative",
    zIndex: 1, // Ensures the logo appears on top
  },
  logo: {
    width: 50,
    height: 50,
    marginLeft: 20,
  },
  headerText: {
    fontWeight: "bold",
    fontFamily: "Times New Roman",
    fontSize: 25,
    color: "white",
    marginLeft: 10,
  },
});

export default Header;
