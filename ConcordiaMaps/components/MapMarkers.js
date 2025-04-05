import React, { useContext } from "react";
import { Marker } from "react-native-maps";
import { Image } from "react-native";
import styles from "../styles";
import { Building } from "../constants/Building";
import { ModalContext } from "../screen/HomeScreen";
import { PointsOfInterest } from "../constants/OutdoorPtsOfDirections"; // Import the new Points of Interest data

const customMarkerImage = require("../assets/PinLogo.png");

const MapMarkers = () => {
  const { toggleModal, setModalData, opiToggleModal, setSelectedOPI } =
    useContext(ModalContext); // Access setModalData

  const handleMarkerPress = (building) => {
    setModalData({
      name: building.name,
      coordinate: building.coordinate,
      address: building.address,
      fullBuildingName: building.fullBuildingName,
    }); // Update modalData

    toggleModal(); // Show modal
  };
  const handleOPIMarkerPress = (poi) => {
    setSelectedOPI(poi);
    opiToggleModal();
  };

  return (
    <>
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
          <Image source={customMarkerImage} style={styles.markerImage} />
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
          <Image source={poi.markerImage} style={styles.customMarkerImage} />
        </Marker>
      ))}
    </>
  );
};

export default MapMarkers;
