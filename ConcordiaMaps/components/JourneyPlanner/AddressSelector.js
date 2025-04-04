import React from "react";
import { View, Text } from "react-native";
import PropTypes from "prop-types";
import FloatingSearchBar from "../OutdoorNavigation/FloatingSearchBar";
import styles from "../../styles/JourneyPlanner/JourneyPlannerScreenStyles";

const AddressSelector = ({ onAddressSelect }) => {
  return (
    <View style={styles.searchBarContainer}>
      <Text style={styles.inputLabel}>Search for an address:</Text>
      <FloatingSearchBar
        onPlaceSelect={onAddressSelect}
        placeholder="Enter an address or landmark"
        testID="address-search-bar"
        nestedScrollEnabled={true}
      />
    </View>
  );
};

AddressSelector.propTypes = {
  onAddressSelect: PropTypes.func.isRequired,
};

export default AddressSelector;
