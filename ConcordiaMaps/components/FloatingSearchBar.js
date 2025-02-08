import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import styles from "../styles";
import PropTypes from "prop-types";

const FloatingSearchBar = ({ onPlaceSelect, placeholder }) => {
  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");

  const searchPlaces = async (text) => {
    setSearchQuery(text);
    setSelectedLocation("");
    if (text.length < 3) {
      setPredictions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_MAPS_API_KEY}&components=country:ca`,
      );
      const { predictions } = await response.json();
      setPredictions(predictions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelection = async (placeId, description) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_MAPS_API_KEY}`,
      );
      const { result } = await response.json();
      if (result?.geometry?.location) {
        onPlaceSelect({
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        });
        setSelectedLocation(description);
        setSearchQuery("");
        setPredictions([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={{ width: "90%" }}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#888" style={styles.icon} />
        <TextInput
          value={searchQuery}
          onChangeText={searchPlaces}
          placeholder={
            selectedLocation || placeholder || "Search for a place..."
          }
          style={styles.input}
        />
        {loading && <ActivityIndicator />}
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery("");
              setPredictions([]);
            }}
          >
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>
      {predictions.length > 0 && (
        <FlatList
          data={predictions}
          keyExtractor={(item) => item.place_id}
          keyboardShouldPersistTaps="handled"
          style={[styles.list, { marginTop: 5 }]}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelection(item.place_id, item.description)}
              style={styles.item}
            >
              <Ionicons
                name="location-outline"
                size={20}
                color="#888"
                style={styles.icon}
              />
              <Text>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};
//fix proptypes
FloatingSearchBar.propTypes = {
  onPlaceSelect: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export default FloatingSearchBar;
