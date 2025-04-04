import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import styles from "../../styles/JourneyPlanner/JourneyPlannerScreenStyles";

const InputTypeSwitcher = ({ inputMode, setInputMode }) => {
  return (
    <View style={styles.inputTypeContainer}>
      <TouchableOpacity
        style={[styles.tabButton, inputMode === "address" && styles.activeTab]}
        onPress={() => setInputMode("address")}
        testID="address-tab"
      >
        <Text style={styles.tabText}>Address</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, inputMode === "building" && styles.activeTab]}
        onPress={() => setInputMode("building")}
        testID="building-tab"
      >
        <Text style={styles.tabText}>Building & Room</Text>
      </TouchableOpacity>
    </View>
  );
};

InputTypeSwitcher.propTypes = {
  inputMode: PropTypes.oneOf(["address", "building"]).isRequired,
  setInputMode: PropTypes.func.isRequired,
};

export default InputTypeSwitcher;
