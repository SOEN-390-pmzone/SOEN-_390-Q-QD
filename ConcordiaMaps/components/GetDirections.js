import React, { useState } from "react";
import { View, Button } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import FloatingSearchBar from "./FloatingSearchBar";
import Header from "./Header";
import NavBar from "./NavBar";
import styles from "../styles";
import { useGoogleMapDirections } from "../hooks/useGoogleMapDirections";
import DirectionsBox from "./DirectionsBox";

const GetDirections = () => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directions, setDirections] = useState([]);
  const [route, setRoute] = useState([]); 
  const [isInNavigationMode, setIsInNavigationMode] = useState(false);
  const [isDirectionsBoxCollapsed, setIsDirectionsBoxCollapsed] = useState(true); // state to tell DirectionsBox when to pop up

    // New state variables for fake GPS coordinates
    const [fakeLatitude, setFakeLatitude] = useState("45.4973");
    const [fakeLongitude, setFakeLongitude] = useState("-73.5789");

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
      //? Goes to navigation Mode
      setIsInNavigationMode(true);
      setIsDirectionsBoxCollapsed(false); //? to pop up the direction box
      console.log("Success! drawing the line..")
    } catch (error) {
      console.error("Geocode Error:", error);
    }
  };

  const onChangeDirections = async() =>{
    setIsInNavigationMode(false);
    setIsDirectionsBoxCollapsed(true);
  }

  const updateOrigin = () => {
    setOrigin({
      latitude: parseFloat(fakeLatitude),
      longitude: parseFloat(fakeLongitude),
    });
  };
  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      <View style={styles.searchContainer}>
        {!isInNavigationMode && (
        <View>
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
        </View>)
        }
        {/* <View style={styles.modes}>
            <Button title="Walking" onPress={() => setMode("walking")}/>
            <Button title="Car" onPress={() => setMode("driving")} />
            <Button title="Transit" onPress={() => setMode("transit")} />
            <Button title="Biking" onPress={() => setMode("biking")} />
          </View> */}
        <View style={styles.buttonContainer}>
          <Button title={isInNavigationMode ? "Change Directions":"Get Directions"} onPress={ isInNavigationMode? onChangeDirections:onAddressSubmit} />
        </View>
      </View>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude:parseFloat(fakeLatitude), // Default center (SGW campus)
          longitude: parseFloat(fakeLongitude),
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
      <DirectionsBox directions={directions}
      isCollapsed={isDirectionsBoxCollapsed} // Pass the state
      setIsCollapsed={setIsDirectionsBoxCollapsed} // Pass the setter function
     />
    </View>
  );
};

export default GetDirections;
