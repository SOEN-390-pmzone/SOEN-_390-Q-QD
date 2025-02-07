import React from "react";
import { View, Text } from "react-native";
import styles from "../styles";

const Legend = () => {
  return (
    <View style={styles.legendContainer}>
      <Text style={styles.title}>Legend</Text>
      <View style={styles.item}>
        <View
          style={[styles.colorBox, { backgroundColor: "rgba(255, 0, 0, 0.5)" }]}
        />
        <Text style={styles.label}>Concordia Building</Text>
      </View>
      <View style={styles.item}>
        <View
          style={[styles.colorBox, { backgroundColor: "rgb(211, 211, 211)" }]}
        />
        <Text style={styles.label}>Other Building</Text>
      </View>
    </View>
  );
};

export default Legend;
