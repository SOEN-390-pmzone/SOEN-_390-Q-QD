import React, { useState } from "react";
import { Marker, Callout } from "react-native-maps";
import { Text, View, Image, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import PopupModal from "./PopupModal";

const customMarkerImage = require("../assets/PinLogo.png");

const MapMarkers = ({ markers }) => {
  if (!markers || markers.length === 0) return null;

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupData, setPopupData] = useState(null);

  const handleMarkerPress = (marker) => {
    setPopupData(marker);
    setPopupVisible(true);
  };

  const closePopup = () => {
    setPopupVisible(false);
    setPopupData(null);
  };

  return (
    <>
      {markers.map((marker, index) => (
        <Marker
          key={index}
          coordinate={marker.coordinate}
          title={marker.name}
          address={marker.address}
          onPress={() => handleMarkerPress(marker)}
        >
          <Image source={customMarkerImage} style={styles.markerImage} />
          <Callout>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutText}>{marker.name}</Text>
              <Text style={styles.calloutText}>{marker.address}</Text>
            </View>
          </Callout>
        </Marker>
      ))}

      <PopupModal
        isVisible={popupVisible}
        data={popupData}
        onClose={closePopup}
      />
    </>
  );
};

const styles = StyleSheet.create({
  markerImage: {
    width: 40,
    height: 40,
  },
  calloutContainer: {
    width: 160,
    height: 50,
    padding: 5,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  calloutText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
});

MapMarkers.propTypes = {
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      coordinate: PropTypes.shape({
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
      }).isRequired,
      name: PropTypes.string.isRequired,
    }),
  ),
};

export default MapMarkers;

export const Building = [
  // SGW Campus buildings latitude and longitude
  {
    name: "Webster Library",
    coordinate: {
      latitude: 45.4968158,
      longitude: -73.5779337,
    },
    address: "1400 De Maisonneuve Blvd W, Montreal, QC H3G 1M8",
  },
  {
    name: "B Annex",
    coordinate: {
      latitude: 45.497856,
      longitude: -73.579588,
    },
    address: "2160 Bishop Street, Montreal, QC H3G 2E9",
  },
  {
    name: "CL Annex",
    coordinate: {
      latitude: 45.494259,
      longitude: -73.579007,
    },
    address: "1665 Ste-Catherine W, Montreal, QC H3H 1L7",
  },
  {
    name: "CI Annex",
    coordinate: {
      latitude: 45.497467,
      longitude: -73.579925,
    },
    address: "2149 Mackay Street, Montreal, QC H3G 2E2",
  },
  {
    name: "D Annex",
    coordinate: {
      latitude: 45.497827,
      longitude: -73.579409,
    },
    address: "2140 Bishop Street, Montreal, QC H3G 2E8",
  },
  {
    name: "EN Annex",
    coordinate: {
      latitude: 45.496944,
      longitude: -73.579555,
    },
    address: "2070 Mackay Street, Montreal, QC H3G 2J1",
  },
  {
    name: "ER Building",
    coordinate: {
      latitude: 45.496428,
      longitude: -73.580212,
    },
    address: "2155 Guy Street, Montreal, QC H3H 2L9",
  },
  {
    name: "ES Building",
    coordinate: {
      latitude: 45.496172,
      longitude: -73.579922,
    },
    address: "2135 Guy Street, Montreal, QC H3H 2L8",
  },
  {
    name: "ET Building",
    coordinate: {
      latitude: 45.496163,
      longitude: -73.579904,
    },
    address: "2125-2127 Guy Street, Montreal, QC H3H 2L7",
  },
  {
    name: "EV Building",
    coordinate: {
      latitude: 45.495376,
      longitude: -73.577997,
    },
    address: "1515 Ste-Catherine W, Montreal, QC H3G 2W1",
  },
  {
    name: "FA Annex",
    coordinate: {
      latitude: 45.496874,
      longitude: -73.579468,
    },
    address: "2060 Mackay Street, Montreal, QC H3G 2J1",
  },
  {
    name: "Faubourg Tower",
    coordinate: {
      latitude: 45.494666,
      longitude: -73.577603,
    },
    address: "1250 Guy Street, Montreal, QC H3H 2L4",
  },
  {
    name: "Faubourg Building",
    coordinate: {
      latitude: 45.494381,
      longitude: -73.578425,
    },
    address: "1610 Ste-Catherine, Montreal, QC H3H 2S2",
  },
  {
    name: "Grey Nuns Annex",
    coordinate: {
      latitude: 45.494123,
      longitude: -73.57787,
    },
    address: "1211-1215 St-Mathieu, Montreal, QC H3H 2P9",
  },
  {
    name: "Guy-De Maisonneuve Building",
    coordinate: {
      latitude: 45.495983,
      longitude: -73.578824,
    },
    address: "1550 De Maisonneuve W, Montreal, QC H3G 1M8",
  },
  {
    name: "Grey Nuns Building - Main Entrance",
    coordinate: {
      latitude: 45.4935,
      longitude: -73.576873,
    },
    address: "1190 Guy Street, Montreal, QC H3H 2L4",
  },
  {
    name: "GS Building",
    coordinate: {
      latitude: 45.496673,
      longitude: -73.581409,
    },
    address: "1538 Sherbrooke W, Montreal, QC H3G 1H6",
  },
  {
    name: "Henry F. Hall",
    coordinate: {
      latitude: 45.497092,
      longitude: -73.5788,
    },
    address: "1455 De Maisonneuve W, Montreal, QC H3G 1M8",
  },
  {
    name: "K Annex",
    coordinate: {
      latitude: 45.497803,
      longitude: -73.579357,
    },
    address: "2150 Bishop Street, Montreal, QC H3G 2E9",
  },
  {
    name: "LC Building",
    coordinate: {
      latitude: 45.496782,
      longitude: -73.577358,
    },
    address: "1426 Bishop Street, Montreal, QC H3G 2E8",
  },
  {
    name: "LD Building",
    coordinate: {
      latitude: 45.496697,
      longitude: -73.577312,
    },
    address: "1424 Bishop Street, Montreal, QC H3G 2E8",
  },
  {
    name: "Learning Square",
    coordinate: {
      latitude: 45.4963149,
      longitude: -73.579472,
    },
    address: "1400 De Maisonneuve W, Montreal, QC H3G 1M8",
  },
  {
    name: "M Annex",
    coordinate: {
      latitude: 45.497368,
      longitude: -73.579777,
    },
    address: "2135 Mackay Street, Montreal, QC H3G 2J1",
  },
  {
    name: "John Molson School Of Business",
    coordinate: {
      latitude: 45.495304,
      longitude: -73.579044,
    },
    address: "1450 Guy Street, Montreal, QC H3H 0A1",
  },
  {
    name: "MI Annex",
    coordinate: {
      latitude: 45.490889,
      longitude: -73.582412,
    },
    address: "2130 Bishop Street, Montreal, QC H3G 2E9",
  },
  {
    name: "MK Annex",
    coordinate: {
      latitude: 45.496606,
      longitude: -73.579025,
    },
    address: "2000-20002 Mackay St, Montreal, QC H3G 2J1",
  },
  {
    name: "MM Annex",
    coordinate: {
      latitude: 45.494665,
      longitude: -73.576315,
    },
    address: "1209 Guy Street, Montreal, QC H3H 2L4",
  },
  {
    name: "MN Annex",
    coordinate: {
      latitude: 45.494568,
      longitude: -73.579553,
    },
    address: "1205-1207 Guy Street, Montreal, QC H3H 2L4",
  },
  {
    name: "Montefiore Building, MT",
    coordinate: {
      latitude: 45.494442,
      longitude: -73.576108,
    },
    address: "1195 Guy Street, Montreal, QC H3H 2L4",
  },
  {
    name: "MU Annex",
    coordinate: {
      latitude: 45.497963,
      longitude: -73.579506,
    },
    address: "2170 Bishop Street, Montreal, QC H3G 2E9",
  },
  {
    name: "P Annex",
    coordinate: {
      latitude: 45.496661,
      longitude: -73.579165,
    },
    address: "2020 Mackay Street, Montreal, QC H3G 2J1",
  },
  {
    name: "PR Annex",
    coordinate: {
      latitude: 45.49697,
      longitude: -73.579851,
    },
    address: "2100 Mackay Street, Montreal, QC H3G 2J1",
  },
  {
    name: "Q Annex",
    coordinate: {
      latitude: 45.496648,
      longitude: -73.579094,
    },
    address: "2010 Mackay Street, Montreal, QC H3G 2J1",
  },
  {
    name: "R Annex",
    coordinate: {
      latitude: 45.496826,
      longitude: -73.579389,
    },
    address: "2050 Mackay Street, Montreal, QC H3G 2J1",
  },
  {
    name: "RR Annex",
    coordinate: {
      latitude: 45.497407,
      longitude: -73.579848,
    },
    address: "2040 Mackay Street, Montreal, QC H3G 2J1",
  },
  {
    name: "S Annex",
    coordinate: {
      latitude: 45.497423,
      longitude: -73.579851,
    },
    address: "2145 Mackay Street, Montreal, QC H3G 2J1",
  },
  {
    name: "Samuel Bronfman Building, SB Building",
    coordinate: {
      latitude: 45.4966,
      longitude: -73.58609,
    },
    address: "1590 Doctor Penfield, Montreal, QC H3G 1C5",
  },
  {
    name: "Toronto-Dominion Building",
    coordinate: {
      latitude: 45.494993,
      longitude: -73.578129,
    },
    address: "1410 Guy Street, Montreal, QC H3H 2L7",
  },
  {
    name: "TU Tunnel",
    coordinate: {
      latitude: 45.49648,
      longitude: -73.578918,
    },
    address: "1550 De Maisonneuve W, Montreal, QC H3G 1M8",
  },
  {
    name: "V Annex",
    coordinate: {
      latitude: 45.497101,
      longitude: -73.579907,
    },
    address: "2110 Mackay Street, Montreal, QC H3G 2J1",
  },
  {
    name: "Visual Art Building",
    coordinate: {
      latitude: 45.495543,
      longitude: -73.573795,
    },
    address: "1395 Rene Levesque W, Montreal, QC H3G 2M5",
  },
  {
    name: "X Annex",
    coordinate: {
      latitude: 45.49694,
      longitude: -73.579593,
    },
    address: "2080 Mackay Street, Montreal, QC H3G 2J1",
  },
  {
    name: "Z Annex",
    coordinate: {
      latitude: 45.496981,
      longitude: -73.579705,
    },
    address: "2090 Mackay Street, Montreal, QC H3G 2J1",
  },

  // Loyola Campus buildings latitude and longitude
  {
    name: "Administration Building",
    coordinate: {
      latitude: 45.457984,
      longitude: -73.639834,
    },
    address: "7141 Sherbrooke West, Montreal, QC H4B 1R6",
  },
  {
    name: "BB Annex",
    coordinate: {
      latitude: 45.459754,
      longitude: -73.639176,
    },
    address: "3502 Bermore Avenue, Montreal, QC H4B 2A3",
  },
  {
    name: "BH Annex",
    coordinate: {
      latitude: 45.459819,
      longitude: -73.639152,
    },
    address: "3500 Bermore Avenue, Montreal, QC H4B 2A3",
  },
  {
    name: "Central Building",
    coordinate: {
      latitude: 45.458204,
      longitude: -73.6403,
    },
    address: "7141 Sherbrooke West, Montreal, QC H4B 1R6",
  },
  {
    name: "Communication Studies and Journalism Building",
    coordinate: {
      latitude: 45.457478,
      longitude: -73.640354,
    },
    address: "7141 Sherbrooke West, Montreal, QC H4B 1R6",
  },
  {
    name: "Stinger Dome",
    coordinate: {
      latitude: 45.457656,
      longitude: -73.636098,
    },
    address: "7200 Sherbrooke West, Montreal, QC H4B 1R6",
  },
  {
    name: "F.C. Smith Building",
    coordinate: {
      latitude: 45.458493,
      longitude: -73.639287,
    },
    address: "7141 Sherbrooke West, Montreal, QC H4B 1R6",
  },
  {
    name: "Centre for Structural and Functional Genomics",
    coordinate: {
      latitude: 45.457017,
      longitude: -73.640432,
    },
    address: "7141 Sherbrooke West, Montreal, QC H4B 1R6",
  },
  {
    name: "Hingston Hall, wing HA",
    coordinate: {
      latitude: 45.459356,
      longitude: -73.64127,
    },
    address: "7141 Sherbrooke West, Montreal, QC H4B 1R6",
  },
  {
    name: "Hingston Hall, wing HB",
    coordinate: {
      latitude: 45.459162,
      longitude: -73.641962,
    },
    address: "7141 Sherbrooke West, Montreal, QC H4B 1R6",
  },
  {
    name: "Hingston Hall, wing HC",
    coordinate: {
      latitude: 45.458504,
      longitude: -73.643225,
    },
    address: "7141 Sherbrooke West, Montreal, QC H4B 1R6",
  },
  {
    name: "Applied Science Hub, HU Building",
    coordinate: {
      latitude: 45.458513,
      longitude: -73.641921,
    },
    address: "7141 Sherbrooke West, Montreal, QC H4B 1R6",
  },
  {
    name: "Jesuit Residence",
    coordinate: {
      latitude: 45.458504,
      longitude: -73.643225,
    },
    address: "7141 Sherbrooke West, Montreal, QC H4B 1R6",
  },
  {
    name: "PB Building",
    coordinate: {
      latitude: 45.456534,
      longitude: -73.638106,
    },
    address: "7200 Sherbrooke West, Montreal, QC H4B 1R6",
  },
  {
    name: "Oscar Peterson Concert Hall, PT Building",
    coordinate: {
      latitude: 45.459308,
      longitude: -73.638941,
    },
    address: "7141 Sherbrooke West, Montreal, QC H4B 1R6",
  },
  {
    name: "Perform Center",
    coordinate: {
      latitude: 45.457088,
      longitude: -73.637683,
    },
    address: "7200 Sherbrooke West, Montreal, QC H4B 1R6",
  },
  {
    name: "Physical Service",
    coordinate: {
      latitude: 45.459636,
      longitude: -73.639758,
    },
    address: "7141 Sherbrooke West",
  },
  {
    name: "Psychology Building",
    coordinate: {
      latitude: 45.458938,
      longitude: -73.640467,
    },
    address: "7141 Sherbrooke W",
  },
  {
    name: "Recreational and Athletics",
    coordinate: {
      latitude: 45.456677,
      longitude: -73.637523,
    },
    address: "7200 Sherbrooke W",
  },
  {
    name: "Loyola Jesuit Hall and Conference Center",
    coordinate: {
      latitude: 45.458551,
      longitude: -73.641016,
    },
    address: "7141 Sherbrooke W",
  },
  {
    name: "Student Center",
    coordinate: {
      latitude: 45.459137,
      longitude: -73.639203,
    },
    address: "7141 Sherbrooke W",
  },
  {
    name: "Solar House, SH Building",
    coordinate: {
      latitude: 45.459298,
      longitude: -73.642478,
    },
    address: "7141 Sherbrooke W",
  },
  {
    name: "Terrebonne Building, TA Building",
    coordinate: {
      latitude: 45.460051,
      longitude: -73.640842,
    },
    address: "7079 Terrebonne",
  },
  {
    name: "TB Annex",
    coordinate: {
      latitude: 45.459992,
      longitude: -73.640897,
    },
    address: "7075 Terrebonne",
  },
  {
    name: "Richard J. Renaud Science Complex",
    coordinate: {
      latitude: 45.457567,
      longitude: -73.641739,
    },
    address: "7141 Sherbrooke W",
  },
  {
    name: "Vanier Library",
    coordinate: {
      latitude: 45.459026,
      longitude: -73.638606,
    },
    address: "7141 Sherbrooke W",
  },
  {
    name: "Vanier Extension",
    coordinate: {
      latitude: 45.459026,
      longitude: -73.638606,
    },
    address: "7141 Sherbrooke W",
  },
];

// Default center coordinates for each campus
export const CampusCoordinates = {
  SGW: {
    latitude: 45.4973,
    longitude: -73.5789,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
  Loyola: {
    latitude: 45.458256,
    longitude: -73.640472,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
};
