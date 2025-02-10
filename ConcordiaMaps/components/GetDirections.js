import React, { useState } from "react";
import { View, Button } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import FloatingSearchBar from "./FloatingSearchBar";
import Header from "./Header";
import NavBar from "./NavBar";
import styles from "../styles";
import { useGoogleMapDirections } from "../hooks/useGoogleMapDirections";
import DirectionsBox from "./DirectionsBox";
const fakePolyline = [
  { latitude: 45.5017, longitude: -73.5673 },   // Start point (e.g., near McGill)
  { latitude: 45.5035, longitude: -73.5696 },
  { latitude: 45.5052, longitude: -73.5714 },
  { latitude: 45.5070, longitude: -73.5732 },
  { latitude: 45.5088, longitude: -73.5750 },
  { latitude: 45.5106, longitude: -73.5768 },
  { latitude: 45.5124, longitude: -73.5786 },
  { latitude: 45.5142, longitude: -73.5804 },
  { latitude: 45.5160, longitude: -73.5822 },
  { latitude: 45.5178, longitude: -73.5840 },   // End point (e.g., Parc Jeanne-Mance)
];
const GetDirections = () => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directions, setDirections] = useState([]);
  const [route, setRoute] = useState(fakePolyline); // Set the fake polyline as the initial state


  // const [mode, setMode] = useState("driving");

  const { getStepsInHTML, getPolyline } = useGoogleMapDirections();

  //? Updates the Direction components with the directions for the text after the button is pressed
  const onAddressSubmit = async () => {
    try {
      const result = await getStepsInHTML(origin, destination);
      setDirections(result);
      //? Sets the polyline
      const polyline = await getPolyline(origin, destination);
      setRoute(polyline);
      console.log("Success! drawing the line..")
    } catch (error) {
      console.error("Geocode Error:", error);
    }
  };
  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      <View style={styles.searchContainer}>
        <FloatingSearchBar
          onPlaceSelect={(location) => {
              setOrigin(location);
          }}
          placeholder="Enter Origin" 
          style={styles.searchBar}
        />
        <FloatingSearchBar
          onPlaceSelect={(location) => {
            setDestination(location);
          }}
          placeholder="Enter Destination"
          style={[styles.searchBar, { marginTop: 10 }]}
        />

        {/* <View style={styles.modes}>
            <Button title="Walking" onPress={() => setMode("walking")}/>
            <Button title="Car" onPress={() => setMode("driving")} />
            <Button title="Transit" onPress={() => setMode("transit")} />
            <Button title="Biking" onPress={() => setMode("biking")} />
          </View> */}
        <View style={styles.buttonContainer}>
          <Button title="Get Directions" onPress={onAddressSubmit} />
        </View>
      </View>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 45.4973, // Default center (SGW campus)
          longitude: -73.5789,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        loadingEnabled={true}
      >
        {origin && <Marker coordinate={origin} title="Origin" />}
        {destination && <Marker coordinate={destination} title="Destination" />}
        {route.length > 0 && (
          <Polyline coordinates={route} strokeWidth={10} strokeColor="blue" />
        )}
      </MapView>
      <DirectionsBox directions={directions} />
    </View>
  );
};

export default GetDirections;
