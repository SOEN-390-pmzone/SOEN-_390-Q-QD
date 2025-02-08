import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import PropTypes from "prop-types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GOOGLE_MAPS_API_KEY } from "@env";

const { width } = Dimensions.get("window");

const FloatingSearchBar = ({ onPlaceSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchPlaces = async (text) => {
    setSearchQuery(text);
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
      console.error("Error fetching places:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelection = async (placeId) => {
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
        setSearchQuery("");
        setPredictions([]);
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#888" style={styles.icon} />
        <TextInput
          value={searchQuery}
          onChangeText={searchPlaces}
          placeholder="Search for a place..."
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
          style={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelection(item.place_id)}
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

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 100,
    width: width - 20,
    alignSelf: "center",
    zIndex: 1,
  },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    flex: 1,
    height: 40,
    marginLeft: 10,
  },
  list: {
    backgroundColor: "white",
    maxHeight: 200,
    marginTop: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  icon: {
    marginRight: 10,
  },
});

FloatingSearchBar.propTypes = {
  onPlaceSelect: PropTypes.func.isRequired,
};

export default FloatingSearchBar;
