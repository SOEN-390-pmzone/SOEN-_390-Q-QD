import React from "react";
import { SafeAreaView, View, Text, Image } from "react-native";
import styles from "../styles";

function Header() {
  return (
    <SafeAreaView>
      <View style={styles.header}>
        <Image
          source={require("../assets/ConcordiaLogo.png")}
          style={styles.logo}
        />
        <Text style={styles.headerText}>ConcordiaMaps</Text>
      </View>
    </SafeAreaView>
  );
}

export default Header;
