import React, {
  useState,
  useEffect,
  createContext,
  useRef,
  useContext,
  useMemo,
} from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import NavBar from "../components/NavBar";
import Header from "../components/Header";
import TemporaryModal from "../components/temporaryModal";
import { LocationContext } from "../contexts/LocationContext";
import Footer from "../components/Footer";
import styles from "../styles";
import { Building } from "../constants/Building";
import { ModalContext } from "../App";
import BuildingColoring from "../components/buildingColoring";
import Legend from "../components/Legend";
import ShuttleStop from "../components/ShuttleStop";
import FloatingSearchBar from "../components/OutdoorNavigation/FloatingSearchBar";
import LiveBusTracker from "../components/LiveBusTracker";
import {
  saveToAsyncStorage,
  getFromAsyncStorage,
} from "../components/AsyncPersistence";
import convertToCoordinates from "../components/convertToCoordinates";
import PropTypes from "prop-types";
import PopupOPI from "../components/PopupOPI"; // Import the new popup component
import NextEventModal from "../components/NextEventModal"; // Import the NextEventModal component
// Marker image assets for Restaurant and Cafe

import PopupModal from "../components/PopupModal";
import MapMarkers from "../components/MapMarkers";
const ModalContext = createContext();

// Correctly defined wrapper component with navigation prop
const PopupModalWrapper = ({ isVisible, data, onClose, navigation }) => {
  return (
    <PopupModal
      isVisible={isVisible}
      data={data}
      onClose={onClose}
      navigation={navigation}
    />
  );
};
const OPIModalWrapper = ({
  opiPopupVisible,
  selectedOPI,
  onClose,
  navigation,
}) => {
  return (
    <PopupOPI
      isVisible={opiPopupVisible}
      data={selectedOPI || { name: "", address: "" }}
      onClose={onClose}
      navigation={navigation}
    />
  );
};
PopupModalWrapper.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
};
OPIModalWrapper.propTypes = {
  opiPopupVisible: PropTypes.bool.isRequired,
  selectedOPI: PropTypes.object, // Remove isRequired
  onClose: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
};
function HomeScreen({ asyncKey = "Campus" }) {
  const loyolaPostalCode = process.env.EXPO_PUBLIC_LOYOLA_POSTAL_CODE;
  const sgwPostalCode = process.env.EXPO_PUBLIC_SGW_POSTAL_CODE;

  const location = useContext(LocationContext);
  const navigation = useNavigation();

  const [postalCode, setPostalCode] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [, setMapRegion] = useState(null);
  const borderColor = "#912338";
  const mapRef = useRef(null);
  const TOGGLE_MODAL_TIMEOUT = 10000;

  const [eventModalVisible, setEventModalVisible] = useState(false);

  // Modals for building pop ups
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    name: "",
    coordinate: { latitude: 0, longitude: 0 },
  });
  const [opiPopupVisible, setOpiPopupVisible] = useState(false);
  const [selectedOPI, setSelectedOPI] = useState(null);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const opiToggleModal = () => {
    setOpiPopupVisible((prev) => !prev);
  };

  // Memoize the context value
  const modalContextValue = useMemo(
    () => ({
      isModalVisible,
      modalData,
      toggleModal,
      setModalData,
      opiToggleModal,
      setSelectedOPI,
      opiPopupVisible,
      selectedOPI,
    }),
    [isModalVisible, modalData, selectedOPI, opiPopupVisible],
  );

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

  const handleOPIMarkerPress = (pointOfInterest) => {
    setSelectedOPI(pointOfInterest);
    setOpiPopupVisible(true);
  };

  const [modalState, setModalState] = useState(true);
  useEffect(() => {
    if (modalState) {
      const timer = setTimeout(() => {
        setModalState(false);
      }, TOGGLE_MODAL_TIMEOUT);

      return () => clearTimeout(timer);
    }
  }, [modalState]);

  return (
    <View style={styles.container} testID="home-screen">
      <ModalContext.Provider value={modalContextValue}>
        <Header />
        <NavBar />
        <FloatingSearchBar onPlaceSelect={handlePlaceSelect} />
        {error ? <Text testID="error-message">{error}</Text> : null}

        {coordinates ? (
          <>
            <TemporaryModal
              text="Press the button to switch campuses"
              time={TOGGLE_MODAL_TIMEOUT}
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
            {PointsOfInterest.map((pointOfInterest) => (
              <Marker
                key={pointOfInterest.name}
                coordinate={pointOfInterest.coordinate}
                title={pointOfInterest.name}
                description={pointOfInterest.address}
                onPress={() => handleOPIMarkerPress(pointOfInterest)}
              >
                <Image
                  source={pointOfInterest.markerImage}
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
              <MapMarkers />
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
        <PopupModalWrapper
          navigation={navigation}
          isVisible={isModalVisible}
          data={modalData}
          onClose={toggleModal}
        />
        <OPIModalWrapper
          navigation={navigation}
          opiPopupVisible={opiPopupVisible}
          selectedOPI={selectedOPI}
          onClose={opiToggleModal}
        />
        <TouchableOpacity
          testID="next-class-button"
          style={styles.buttonNext}
          onPress={() => setEventModalVisible(true)}
        >
          <Text style={styles.buttonNextText}>Next Class</Text>
        </TouchableOpacity>
        <NextEventModal
          testID="next-event-modal"
          isVisible={eventModalVisible}
          onClose={() => setEventModalVisible(false)}
        />
      </ModalContext.Provider>
    </View>
  );
}

HomeScreen.propTypes = {
  asyncKey: PropTypes.string,
};

export { ModalContext };
export default HomeScreen;
