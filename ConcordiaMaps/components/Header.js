import React from "react";
import { SafeAreaView, StyleSheet, View, Text, Image } from "react-native";

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
