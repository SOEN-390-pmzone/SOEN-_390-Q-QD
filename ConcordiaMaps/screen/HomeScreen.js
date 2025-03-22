import React, { useState, useEffect, useRef, useContext } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import NavBar from "../components/NavBar";
import Header from "../components/Header";
import TemporaryModal from "../components/temporaryModal";
import { LocationContext } from "../contexts/LocationContext";
import Footer from "../components/Footer";
import styles from "../styles";
import { Building } from "../components/MapMarkers";
import { ModalContext } from "../App";
import BuildingColoring from "../components/buildingColoring";
import Legend from "../components/Legend";
import ShuttleStop from "../components/ShuttleStop";
import FloatingSearchBar from "../components/FloatingSearchBar";
import LiveBusTracker from "../components/LiveBusTracker";
import {
  saveToAsyncStorage,
  getFromAsyncStorage,
} from "../components/AsyncPersistence";
import convertToCoordinates from "../components/convertToCoordinates";
import PropTypes from "prop-types";
import PopupOPI from "../components/PopupOPI"; // Import the new popup component

// Marker image assets for Restaurant and Cafe
const restaurantMarker = require("../assets/restoICON.png");
const cafeMarker = require("../assets/cafeICON.png");
const customMarkerImage = require("../assets/PinLogo.png");

// Example data for PointsOfInterest
const PointsOfInterest = [
  {
    name: "Poulet Rouge",
    coordinate: { latitude: 45.4947454, longitude: -73.5783503 },
    address: "1623 Rue Sainte-Catherine, Montréal, QC H3H 1L8",
    markerImage: restaurantMarker,
  },
  {
    name: "Marche Newon",
    coordinate: { latitude: 45.4943362, longitude: -73.5785438 },
    address: "1616 Rue Sainte-Catherine 302 unit, Montréal, QC H3H 1L7",
    markerImage: restaurantMarker,
  },
  {
    name: "Tim Horton's",
    coordinate: { latitude: 45.4948692, longitude: -73.5782373 },
    address: "1611 Rue Sainte-Catherine , Montréal, QC H3H 1L8",
    markerImage: cafeMarker,
  },
  {
    name: "Subway",
    coordinate: { latitude: 45.49601, longitude: -73.5801927 },
    address: "2144 guy st, Montréal, QC H3H 2N4",
    markerImage: restaurantMarker,
  },
  {
    name: "Second Cup",
    coordinate: { latitude: 45.4992233, longitude: -73.5735757 },
    address: "Rue Sainte-Catherine ST W Suite 1166 , Montréal, QC H3B 1K1",
    markerImage: cafeMarker,
  },
  {
    name: "Java U",
    coordinate: { latitude: 45.4958331, longitude: -73.5791174 },
    address: "1455 Guy St , Montréal, QC H3H 2L5",
    markerImage: cafeMarker,
  },
];

function HomeScreen({ asyncKey = "Campus" }) {
  const loyolaPostalCode = process.env.EXPO_PUBLIC_LOYOLA_POSTAL_CODE;
  const sgwPostalCode = process.env.EXPO_PUBLIC_SGW_POSTAL_CODE;

  const location = useContext(LocationContext);
  const { toggleModal, setModalData } = useContext(ModalContext);

  const [postalCode, setPostalCode] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [, setMapRegion] = useState(null);
  const borderColor = "#912338";
  const mapRef = useRef(null);
  const toggleModalTime = "10000";

  // State for OPI (Points of Interest) popup
  const [opiPopupVisible, setOpiPopupVisible] = useState(false);
  const [selectedOPI, setSelectedOPI] = useState(null);

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
    if (location) {
      setMapRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, [location]);

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
      );
    }
  }, [coordinates]);

  const handleChangeCampuses = () => {
    setPostalCode((prevPostalCode) =>
      prevPostalCode === sgwPostalCode ? loyolaPostalCode : sgwPostalCode,
    );
  };

  const handlePlaceSelect = (newRegion) => {
    console.log("handlePlaceSelect called with:", newRegion);
    const region = {
      ...newRegion,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };

    setTimeout(() => {
      setMapRegion(region);
      setSelectedLocation(region);
      mapRef.current?.animateToRegion(region, 1000);
    }, 100);
  };

  const handleMarkerPress = (building) => {
    setModalData({
      name: building.name,
      coordinate: building.coordinate,
      address: building.address,
      fullBuildingName: building.fullBuildingName,
    });
    toggleModal();
  };

  const handleOPIMarkerPress = (poi) => {
    setSelectedOPI(poi);
    setOpiPopupVisible(true);
  };

  const [modalState, setModalState] = useState(true);
  useEffect(() => {
    if (modalState) {
      const timer = setTimeout(() => {
        setModalState(false);
      }, toggleModalTime);

      return () => clearTimeout(timer);
    }
  }, [modalState]);

  return (
    <View style={styles.container} testID="home-screen">
      <Header />
      <NavBar />
      <FloatingSearchBar onPlaceSelect={handlePlaceSelect} />
      {error ? <Text testID="error-message">{error}</Text> : null}

      {coordinates ? (
        <>
          <TemporaryModal
            text="Press the button to switch campuses"
            time={toggleModalTime}
            modalState={modalState}
            onRequestClose={() => setModalState(false)}
            TestID="toggleModal"
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
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }
            }
            showsUserLocation={true}
            loadingEnabled={true}
            watchUserLocation={true}
            onRegionChangeComplete={(region) => setMapRegion(region)}
          >
            {Building.map((building) => (
              <Marker
                key={`${building.name}-${building.coordinate.latitude}-${building.coordinate.longitude}`}
                testID={`marker-${building.name?.toLowerCase().replace(/\s+/g, "-") || building.id}`}
                coordinate={building.coordinate}
                title={building.name}
                address={building.address}
                fullBuildingName={building.fullBuildingName}
                onPress={() => handleMarkerPress(building)}
              >
                <Image
                  source={customMarkerImage}
                  style={styles.customMarkerImage}
                />
              </Marker>
            ))}
            {PointsOfInterest.map((poi) => (
              <Marker
                key={poi.name}
                coordinate={poi.coordinate}
                title={poi.name}
                description={poi.address}
                onPress={() => handleOPIMarkerPress(poi)}
              >
                <Image
                  source={poi.markerImage}
                  style={styles.customMarkerImage}
                />
              </Marker>
            ))}
            <BuildingColoring />
            {selectedLocation && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                }}
                title="Selected Location"
              />
            )}
            <ShuttleStop />
            <LiveBusTracker mapRef={mapRef} />
          </MapView>
          <View style={styles.toggleView}>
            <TouchableOpacity
              testID="change-campus-button"
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
                resizeMode={"cover"}
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

      {/* OPI Popup */}
      <PopupOPI
        isVisible={opiPopupVisible}
        data={selectedOPI || { name: "", address: "" }}
        onClose={() => setOpiPopupVisible(false)}
      />
    </View>
  );
}

HomeScreen.propTypes = {
  asyncKey: PropTypes.string,
};

export default HomeScreen;
