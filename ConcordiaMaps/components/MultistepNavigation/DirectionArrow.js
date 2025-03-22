import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../../styles/MultistepNavigation/DirectionArrowStyles";

const DirectionArrow = () => (
  <View style={styles.container}>
    <Ionicons
      name="chevron-down"
      size={28}
      color="#912338"
      style={styles.icon}
    />
  </View>
);

export default DirectionArrow;
