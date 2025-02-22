import React, { useState, useEffect, useRef, useContext } from "react";
import { View, Text, TouchableOpacity, Image, Animated } from "react-native";
import axios from "axios";
import MapView, { Marker } from "react-native-maps";
import NavBar from "../components/NavBar";
import Header from "../components/Header";
import ToggleModal from "../components/toggleModal"
import { LocationContext } from "../contexts/LocationContext";
import Footer from "../components/Footer";
import styles from "../styles";

const customMarkerImage = require("../assets/PinLogo.png");
import { Building } from "../components/MapMarkers";
import BuildingColoring from "../components/buildingColoring";
import Legend from "../components/Legend";
import ShuttleStop from "../components/ShuttleStop";

function HomeScreen() {
  const loyolaPostalCode = process.env.EXPO_PUBLIC_LOYOLA_POSTAL_CODE;
  const sgwPostalCode = process.env.EXPO_PUBLIC_SGW_POSTAL_CODE;
  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const location = useContext(LocationContext);

  const [postalCode, setPostalCode] = useState(sgwPostalCode);
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState("");
  

  const mapRef = useRef(null);

  const convertToCoordinates = async (postal_code) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${postal_code}&key=${GOOGLE_MAPS_API_KEY}`,
      );
      const { status, results } = response.data;

      if (status === "OK") {
        if (results.length > 0) {
          const { lat, lng } = results[0].geometry.location;
          setCoordinates({ latitude: lat, longitude: lng });
          setError("");
        } else {
          setCoordinates(null);
          setError("No results found.");
        }
      } else {
        setCoordinates(null);
        setError(`${status}`);
      }
    } catch (error) {
      setCoordinates(null);
      setError("Something went wrong. Please try again later.");
      console.log(error);
    }
  };

  useEffect(() => {
    if (coordinates && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        2500,
      ); // Duration of the animation in milliseconds
    }
  }, [coordinates]);

  useEffect(() => {
    convertToCoordinates(postalCode);
  }, [postalCode]);

  const handleChangeCampuses = () => {
    setPostalCode((prevPostalCode) =>
      prevPostalCode === sgwPostalCode ? loyolaPostalCode : sgwPostalCode,
    );
  };
  const [borderColorAnim] = useState(new Animated.Value(0)); // Create an animated value
  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#000000", "#FF0000"], // Change from black to red
  });
  useEffect(() => {
    // Define the border color animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(borderColorAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(borderColorAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [borderColorAnim]);
  
  
  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      {error ? <Text testID="error-message">{error}</Text> : null}

      {coordinates ? (
        <>
          <MapView
            testID="map-view"
            style={styles.map}
            ref={mapRef}
            initialRegion={
              location
                ? {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }
                : {
                    latitude: 45.4973, // Default center (SGW campus)
                    longitude: -73.5789,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }
            }
            showsUserLocation={true}
            loadingEnabled={true}
            watchUserLocation={true}
          >
            {Building.map((building, index) => (
              <Marker
                key={index}
                coordinate={building.coordinate}
                title={building.name}
              >
                <Image
                  source={customMarkerImage}
                  style={styles.customMarkerImage}
                />
              </Marker>
            ))}
            <BuildingColoring />
            <ShuttleStop />
          </MapView>
        </>
      ) : (
        <Text>Loading...</Text>
      )}
      {error ? <Text>Error: {error}</Text> : null}
      <View style={styles.toggleView}>
        <TouchableOpacity
          onPress={handleChangeCampuses}
          activeOpacity={0.7}
        >
          <Animated.View style={[styles.button, { borderColor }]}>
            <Image
              style={styles.buttonImage}
              source={require("../assets/download.jpg")}
              resizeMode={"cover"} // cover or contain its up to you view look
            />
          </Animated.View>
        </TouchableOpacity>
        <ToggleModal text = "Press the coat of arms to switch campuses"/>
      </View>
      
      <Legend />
      <Footer />
      
    </View>
  );
}

export default HomeScreen;
