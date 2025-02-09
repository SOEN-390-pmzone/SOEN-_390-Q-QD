import React, { useState } from "react";
import { View, Button } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import FloatingSearchBar from "./FloatingSearchBar";
import Header from "./Header";
import Footer from "./Footer";
import NavBar from "./NavBar";
import styles from "../styles";
import { useGoogleMapDirections } from "../hooks/useGoogleMapDirections";
import DirectionsDropdown from "./DirectionsBox";

const GetDirections = () => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState([]);
  const [isOriginSearch, setIsOriginSearch] = useState(true);
  const [directions, setDirections] = useState([]);
    const [mode, setMode] = useState("driving"); 


  const {getStepsInHTML } = useGoogleMapDirections();


    //? Updates the Direction components with the directions for the text after the button is pressed
  const onAddressSubmit = async() => {
    try {
      const result = await getStepsInHTML(origin, destination);
      setDirections(result); 
    } catch(error) {
      console.error('Geocode Error:', error);
    }
  }
  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      <View style={styles.searchContainer}>
        <FloatingSearchBar
          onPlaceSelect={(location) => {
            if (isOriginSearch) {
              setOrigin(location);
              setIsOriginSearch(false);
            } else {
              setDestination(location);
            }
          }}
          placeholder={isOriginSearch ? "Enter Origin" : "Enter Destination"}
          style={styles.searchBar}
        />
        <FloatingSearchBar
          onPlaceSelect={(location) => {
            setDestination(location);
          }}
          placeholder="Enter Destination"
          style={[styles.searchBar, { marginTop: 10 }]}
        />
       
          <View style={styles.modes}>
            <Button title="Walking" onPress={() => setMode("walking")}/>
            <Button title="Car" onPress={() => setMode("driving")} />
            <Button title="Transit" onPress={() => setMode("transit")} />
            <Button title="Biking" onPress={() => setMode("biking")} />
          </View>
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
      >
        {origin && <Marker coordinate={origin} title="Origin" />}
        {destination && <Marker coordinate={destination} title="Destination" />}
        {route.length > 0 && (
          <Polyline coordinates={route} strokeWidth={4} strokeColor="blue" />
        )}
      </MapView>
      <DirectionsDropdown directions= {directions}/>   
    </View>
  );
};

export default GetDirections;
