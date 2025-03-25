import React, { useState, useEffect, useRef } from "react";
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
import * as Crypto from "expo-crypto";

const FloatingSearchBar = ({
  onPlaceSelect,
  placeholder,
  value,
  onChangeText,
  onFocus,
}) => {
  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const setSelectedLocationDescription = useState("")[1];
  const [userLocation, setUserLocation] = useState(null);
  const sessionTokenRef = useRef("");
  const inputRef = useRef(null); // Add ref for TextInput

  const generateRandomToken = async () => {
    try {
      // Use expo-crypto for generating random bytes
      const randomBytes = await Crypto.getRandomBytesAsync(16);

      // Convert to base64 string
      let base64 = "";
      for (let i = 0; i < randomBytes.length; i++) {
        base64 += String.fromCharCode(randomBytes[i]);
      }
      base64 = btoa(base64);

      // Remove non-alphanumeric characters and trim to length
      return base64.replace(/[+/=]/g, "").substring(0, 16);
    } catch (error) {
      console.error("Error generating random token:", error);

      // Fallback using the Web Crypto API as recommended by SonarQube
      try {
        // For client-side React Native environments
        const crypto = global.crypto || global.msCrypto;
        if (crypto && crypto.getRandomValues) {
          const array = new Uint32Array(4);
          crypto.getRandomValues(array);
          return Array.from(array)
            .map((n) => n.toString(36))
            .join("")
            .substring(0, 16);
        }
      } catch (webCryptoError) {
        console.error("Web Crypto API fallback failed:", webCryptoError);
      }

      // If we've reached here, both secure methods failed
      // Rather than using an insecure method, use a deterministic value
      // This is safer than using Math.random() for security-sensitive operations
      console.warn(
        "Failed to generate secure token, using fallback constant value",
      );
      return "TOKEN_GENERATION_FAILED_" + Date.now().toString().substring(0, 8);
    }
  };

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
      let locationParam = "";
      if (userLocation?.latitude && userLocation?.longitude) {
        locationParam = `&location=${userLocation.latitude},${userLocation.longitude}&radius=5000`;
      } else {
        console.warn(
          "User location not available. Searching without location bias.",
        );
      }

      //use the session token to prevent caching of search results
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_MAPS_API_KEY}&components=country:ca${locationParam}&sessiontoken=${sessionTokenRef.current}`,
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
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_MAPS_API_KEY}&sessiontoken=${sessionTokenRef.current}`,
      );
      const { result } = await response.json();
      if (result?.geometry?.location) {
        onPlaceSelect({
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        });
        setSearchQuery(description);
        setSelectedLocationDescription(description);
        setPredictions([]);
        setSearchQuery(description);

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
          onChangeText={searchPlaces}
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
  value: PropTypes.string,
  onChangeText: PropTypes.func,
  onFocus: PropTypes.func,
};

export default FloatingSearchBar;
