import React, { useState } from "react";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import styles from "../styles";
import ShuttleSchedule from "./ShuttleSchedule";

function NavBar() {
  const [isScheduleVisible, setIsScheduleVisible] = useState(false);
  const navigation = useNavigation();

  const handlePress = (item) => {
    if (item === "Get directions") {
      navigation.navigate("GetDirections");
    } else {
      Alert.alert(`You clicked: ${item}`);
    }
  };

  return (
    <View style={styles.navbar} testID="hamburger-menu">
      <TouchableOpacity onPress={() => handlePress("Login")}>
        <Text style={styles.menuItem}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handlePress("Get directions")}>
        <Text style={styles.menuItem}>Get directions</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handlePress("Outdoor Points of Interest")}
      >
        <Text style={styles.menuItem}>Outdoor Points of Interest</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handlePress("Smart Planner")}>
        <Text style={styles.menuItem}>Smart Planner</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setIsScheduleVisible(true)}
        testID="shuttle-schedule-modal"
      >
        <Text style={styles.menuItem}>Shuttle Schedule</Text>
      </TouchableOpacity>

      {/* Shuttle Schedule Popup */}
      <ShuttleSchedule
        visible={isScheduleVisible}
        onClose={() => setIsScheduleVisible(false)}
      />
    </View>
  );
}

export default NavBar;
