import React, { useContext } from "react";
import { Marker } from "react-native-maps";
import { Image } from "react-native";
import styles from "../styles";
import { Building } from "../constants/Building";
import { ModalContext } from "../App";
const customMarkerImage = require("../assets/PinLogo.png");

const MapMarkers = () => {
  const { toggleModal, setModalData } = useContext(ModalContext); // Access setModalData

  const handleMarkerPress = (building) => {
    setModalData({
      name: building.name,
      coordinate: building.coordinate,
      address: building.address,
      fullBuildingName: building.fullBuildingName,
    }); // Update modalData
    toggleModal(); // Show modal
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
    </>
  );
};

export default MapMarkers;
