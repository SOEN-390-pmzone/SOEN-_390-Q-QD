import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import styles from "../styles";
import PropTypes from "prop-types";

const FloatingSearchBar = ({ onPlaceSelect, placeholder }) => {
  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("No access to location");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const userCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(userCoords);
      } catch (error) {
        console.error("Error getting location:", error);
      }
    })();
  }, []);

  const searchPlaces = async (text) => {
    setSearchQuery(text);
    setSelectedLocation("");
    if (text.length < 3) {
      setPredictions([]);
      return;
    }
    setLoading(true);

    try {
      let locationParam = "";
      if (userLocation?.latitude && userLocation?.longitude) {
        locationParam = `&location=${userLocation.latitude},${userLocation.longitude}&radius=5000`;
      } else {
        console.warn(
          "User location not available. Searching without location bias.",
        );
      }

      const sessionToken = Math.random().toString(36).substring(2, 15);

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_MAPS_API_KEY}&components=country:ca${locationParam}&sessiontoken=${sessionToken}`,
      );

      const { predictions } = await response.json();
      setPredictions(predictions || []);
    } catch (error) {
      console.error(error);
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

FloatingSearchBar.propTypes = {
  onPlaceSelect: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export default FloatingSearchBar;
