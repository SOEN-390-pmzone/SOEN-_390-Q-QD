import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image } from "react-native";
import styles from "../styles.js";

function Footer() {
  return (
    <View style={styles.bottom}>
      <Text style={styles.text}>Footer</Text>
    </View>
  );
}

export default Footer;
