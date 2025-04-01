import React, { useEffect } from "react"; // Import useEffect
import { View, Text } from "react-native";
import * as Sentry from '@sentry/react-native'; // Import Sentry
import styles from "../styles.js";

function Footer() {
  const start = performance.now(); // Record start time

  useEffect(() => {
    const end = performance.now(); // Record end time after render
    const duration = end - start;
    Sentry.setMeasurement("ui.footerComponent.render", duration, "millisecond"); // Send measurement
    // console.log(`Footer render duration: ${duration} ms`); // Optional: for local debugging
  }); // Runs after every render
  return (
    <View style={styles.bottom}>
      <Text style={styles.text}>Footer</Text>
    </View>
  );
}
export default Footer;
