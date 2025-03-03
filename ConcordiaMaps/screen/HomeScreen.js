import React, { useState, useEffect, useRef, useContext } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import NavBar from "../components/NavBar";
import Header from "../components/Header";
import TemporaryModal from "../components/temporaryModal";
import { LocationContext } from "../contexts/LocationContext";
import Footer from "../components/Footer";
import styles from "../styles";
const customMarkerImage = require("../assets/PinLogo.png");
import { Building } from "../components/MapMarkers";
import BuildingColoring from "../components/buildingColoring";
import Legend from "../components/Legend";
import ShuttleStop from "../components/ShuttleStop";
import {
  saveToAsyncStorage,
  getFromAsyncStorage,
} from "../components/AsyncPersistence";
import convertToCoordinates from "../components/convertToCoordinates";
import PropTypes from "prop-types";

function HomeScreen({ asyncKey = "Campus" }) {
  const loyolaPostalCode = process.env.EXPO_PUBLIC_LOYOLA_POSTAL_CODE;
  const sgwPostalCode = process.env.EXPO_PUBLIC_SGW_POSTAL_CODE;

  const location = useContext(LocationContext);

  const [postalCode, setPostalCode] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState("");
  const [modalState, setModalState] = useState(true);
  const [borderColor, setBorderColor] = useState("#912338"); // Initial border color (red)
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchLastCampus = async () => {
      const campus = await getFromAsyncStorage(asyncKey, sgwPostalCode);
      setPostalCode(campus);
      const coords = await convertToCoordinates(campus);
      if (coords.error) {
        setError(coords.error);
      } else {
        setCoordinates(coords);
      }
    };
    fetchLastCampus();
  }, []);

  useEffect(() => {
    const saveCurrentCampus = async (asyncKey, postalcode) => {
      if (postalcode) {
        await saveToAsyncStorage(asyncKey, postalCode);
        const coordinates = await convertToCoordinates(postalCode);
        if (coordinates.error) {
          setError(coordinates.error);
        } else {
          setCoordinates(coordinates);
        }
      }
    };
    saveCurrentCampus(asyncKey, postalCode);
  }, [postalCode]);

  useEffect(() => {
    if (modalState) {
      const timer = setTimeout(() => {
        setBorderColor("#ffffff");
        setModalState(false);
      }, 3000); // Modal will disappear after 3 seconds

      return () => clearTimeout(timer); // Cleanup the timer if the component unmounts
    }
  }, [modalState]);

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

  const handleChangeCampuses = () => {
    setPostalCode((prevPostalCode) =>
      prevPostalCode === sgwPostalCode ? loyolaPostalCode : sgwPostalCode,
    );
  };
  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      {error ? <Text testID="error-message">{error}</Text> : null}

      {coordinates ? (
        <>
          <TemporaryModal
            text="Press the button to switch campuses"
            my_state={modalState}
            time="3000"
          />
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
                    latitude: coordinates.latitude, // Default center (SGW campus)
                    longitude: coordinates.longitude,
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
          <View style={styles.toggleView}>
            <TouchableOpacity
              testID="toggle-button"
              onPress={handleChangeCampuses}
              activeOpacity={0.7}
              style={{
                borderColor: borderColor,
                borderWidth: 2,
                borderRadius: 10,
              }}
            >
              <Image
                style={styles.buttonImage}
                source={require("../assets/ToggleButton.png")}
                resizeMode={"cover"} // cover or contain its up to you view look
              />
            </TouchableOpacity>
          </View>
          <Legend />
        </>
      ) : (
        <Text>Loading...</Text>
      )}
      {error ? <Text>Error: {error}</Text> : null}

      <Footer />
    </View>
  );
}
HomeScreen.propTypes = {
  asyncKey: PropTypes.string,
};
export default HomeScreen;
