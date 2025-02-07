import React, { useContext } from "react";
import { View, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import NavBar from "../components/NavBar";
import Header from "../components/Header";
import { LocationContext } from "../contexts/LocationContext";
import Footer from "../components/Footer";
import styles from "../styles";
import { Building } from "../components/MapMarkers";
import { ModalContext } from "../App"; // Import ModalContext
import PopupModal from "../components/PopupModal"; // Adjust the path if necessary


const customMarkerImage = require("../assets/PinLogo.png");

function HomeScreen() {
  const location = useContext(LocationContext);
  const { isModalVisible, modalData, toggleModal } = useContext(ModalContext); // Correctly access modal context

  // Function to handle marker press and pass data to the modal
  const handleMarkerPress = (building) => {
    toggleModal(); // Show modal
    modalData.name = building.name; // Set the building name
    modalData.coordinate = building.coordinate; // Set the building coordinates
  };

  return (
    <View style={styles.container}>
      <Header />
      <NavBar /> {/* Navigation bar */}

      {/* Map view */}
      <MapView
        style={styles.map}
        region={
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
        {/* Render building markers */}
        {Building.map((building, index) => (
          <Marker
            key={index}
            coordinate={building.coordinate}
            title={building.name}
            onPress={() => handleMarkerPress(building)} // Trigger modal on press
          >
            <Image source={customMarkerImage} style={styles.customMarkerImage} />
          </Marker>
        ))}
      </MapView>

      {/* Footer */}
      <Footer />

      {/* Show the popup modal */}
      <PopupModal
        isVisible={isModalVisible}
        data={modalData}
        onClose={toggleModal}
      />
    </View>
  );
}

export default HomeScreen;
