import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import styles from "../../styles";
import PropTypes from "prop-types";
import { useGoogleMapDirections } from "../../hooks/useGoogleMapDirections";

const FloatingSearchBar = ({
  onPlaceSelect,
  placeholder,
  value,
  onChangeText,
  onFocus,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const setSelectedLocationDescription = useState("")[1];
  const [userLocation, setUserLocation] = useState(null);
  const sessionTokenRef = useRef("");
  const inputRef = useRef(null);

  // Use the hook instead of importing the API key directly
  const {
    generateRandomToken,
    searchPlaces: searchPlacesFromHook,
    fetchPlaceDetails,
  } = useGoogleMapDirections();

  // Generate a new session token when component mounts
  useEffect(() => {
    const initToken = async () => {
      const token = await generateRandomToken();
      sessionTokenRef.current = token;
    };

    initToken();
    return () => {
      // Clear session token on unmount
      sessionTokenRef.current = "";
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("No access to location");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error("Error getting location:", error);
      }
    })();
  }, []);

  const searchPlaces = async (text) => {
    setSearchQuery(text);
    setSelectedLocationDescription("");
    if (text.length < 3) {
      setPredictions([]);
      return;
    }
    setLoading(true);

    try {
      // Use the searchPlaces method from the hook
      const { predictions: placePredictions, error } =
        await searchPlacesFromHook(text, userLocation, sessionTokenRef.current);

      if (error) {
        console.error("Error searching places:", error);
      } else {
        setPredictions(placePredictions);
      }
    } catch (error) {
      console.error("Error in searchPlaces:", error);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelection = async (placeId, description) => {
    try {
      // Use the fetchPlaceDetails method from the hook
      const placeDetails = await fetchPlaceDetails(
        placeId,
        sessionTokenRef.current,
      );

      if (placeDetails) {
        onPlaceSelect({
          latitude: placeDetails.latitude,
          longitude: placeDetails.longitude,
        });
        setSearchQuery(description);
        setSelectedLocationDescription(description);
        setPredictions([]);

        // Get a new token for next search
        const newToken = await generateRandomToken();
        sessionTokenRef.current = newToken;

        // Reset cursor position to beginning after a short delay
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setSelection(0, 0);
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  // Use controlled input if value is provided
  const displayValue = value !== undefined ? value : searchQuery;

  return (
    <View style={{ width: "90%" }}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#888" style={styles.icon} />
        <TextInput
          ref={inputRef}
          value={displayValue}
          onChangeText={(text) => {
            if (onChangeText) onChangeText(text);
            searchPlaces(text);
          }}
          placeholder={placeholder || "Search for a place..."}
          style={styles.input}
          onFocus={onFocus}
        />
        {loading && <ActivityIndicator />}
        {displayValue.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery("");
              setSelectedLocationDescription("");
              setPredictions([]);
              if (onChangeText) {
                onChangeText("");
              }
            }}
          >
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Replace FlatList with direct mapping in a ScrollView */}
      {predictions.length > 0 && (
        <View style={[styles.list, { marginTop: 5 }]}>
          {predictions.map((item) => (
            <TouchableOpacity
              key={item.place_id}
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
          ))}
        </View>
      )}
    </View>
  );
};

FloatingSearchBar.propTypes = {
  onPlaceSelect: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChangeText: PropTypes.func,
  onFocus: PropTypes.func,
  nestedScrollEnabled: PropTypes.bool,
};

export default FloatingSearchBar;
