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
          onPress={() => handleMarkerPress(marker)}
        >
          <Image source={customMarkerImage} style={styles.markerImage} />
          <Callout>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutText}>{marker.name}</Text>
            </View>
          </Callout>
        </Marker>
      ))}


      {/* Using PopupModal */}
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
  },
  {
    name: "B Annex",
    coordinate: {
      latitude: 45.497856,
      longitude: -73.579588,
    },
  },
  {
    name: "CL Annex",
    coordinate: {
      latitude: 45.494259,
      longitude: -73.579007,
    },
  },
  {
    name: "CI Annex",
    coordinate: {
      latitude: 45.497467,
      longitude: -73.579925,
    },
  },
  {
    name: "D Annex",
    coordinate: {
      latitude: 45.497827,
      longitude: -73.579409,
    },
  },
  {
    name: "EN Annex",
    coordinate: {
      latitude: 45.496944,
      longitude: -73.579555,
    },
  },
  {
    name: "ER Building",
    coordinate: {
      latitude: 45.496428,
      longitude: -73.580212,
    },
  },
  {
    name: "ES Building",
    coordinate: {
      latitude: 45.496172,
      longitude: -73.579922,
    },
  },
  {
    name: "ET Building",
    coordinate: {
      latitude: 45.496163,
      longitude: -73.579904,
    },
  },
  {
    name: "EV Building",
    coordinate: {
      latitude: 45.495376,
      longitude: -73.577997,
    },
  },
  {
    name: "FA Annex",
    coordinate: {
      latitude: 45.496874,
      longitude: -73.579468,
    },
  },
  {
    name: "Faubourg Tower",
    coordinate: {
      latitude: 45.494666,
      longitude: -73.577603,
    },
  },
  {
    name: "Faubourg Building",
    coordinate: {
      latitude: 45.494381,
      longitude: -73.578425,
    },
  },
  {
    name: "Grey Nuns Annex",
    coordinate: {
      latitude: 45.494123,
      longitude: -73.57787,
    },
  },
  {
    name: "Guy-De Maisonneuve Building",
    coordinate: {
      latitude: 45.495983,
      longitude: -73.578824,
    },
  },
  {
    name: "Grey Nuns Building - Main Entrance",
    coordinate: {
      latitude: 45.4935,
      longitude: -73.576873,
    },
  },
  {
    name: "GS Building",
    coordinate: {
      latitude: 45.496673,
      longitude: -73.581409,
    },
  },
  {
    name: "Henry F. Hall",
    coordinate: {
      latitude: 45.497092,
      longitude: -73.5788,
    },
  },
  {
    name: "K Annex",
    coordinate: {
      latitude: 45.497803,
      longitude: -73.579357,
    },
  },
  {
    name: "LC Building",
    coordinate: {
      latitude: 45.496782,
      longitude: -73.577358,
    },
  },
  {
    name: "LD Building",
    coordinate: {
      latitude: 45.496697,
      longitude: -73.577312,
    },
  },
  {
    name: "Learning Square",
    coordinate: {
      latitude: 45.4963149,
      longitude: -73.579472,
    },
  },
  {
    name: "M Annex",
    coordinate: {
      latitude: 45.497368,
      longitude: -73.579777,
    },
  },
  {
    name: "John Molson School Of Business",
    coordinate: {
      latitude: 45.495304,
      longitude: -73.579044,
    },
  },
  {
    name: "MI Annex",
    coordinate: {
      latitude: 45.490889,
      longitude: -73.582412,
    },
  },
  {
    name: "MK Annex",
    coordinate: {
      latitude: 45.496606,
      longitude: -73.579025,
    },
  },
  {
    name: "MM Annex",
    coordinate: {
      latitude: 45.494665,
      longitude: -73.576315,
    },
  },
  {
    name: "MN Annex",
    coordinate: {
      latitude: 45.494568,
      longitude: -73.579553,
    },
  },
  {
    name: "Montefiore Building, MT",
    coordinate: {
      latitude: 45.494442,
      longitude: -73.576108,
    },
  },
  {
    name: "MU Annex",
    coordinate: {
      latitude: 45.497963,
      longitude: -73.579506,
    },
  },
  {
    name: "P Annex",
    coordinate: {
      latitude: 45.496661,
      longitude: -73.579165,
    },
  },
  {
    name: "PR Annex",
    coordinate: {
      latitude: 45.49697,
      longitude: -73.579851,
    },
  },
  {
    name: "Q Annex",
    coordinate: {
      latitude: 45.496648,
      longitude: -73.579094,
    },
  },
  {
    name: "R Annex",
    coordinate: {
      latitude: 45.496826,
      longitude: -73.579389,
    },
  },
  {
    name: "RR Annex",
    coordinate: {
      latitude: 45.497407,
      longitude: -73.579848,
    },
  },
  {
    name: "S Annex",
    coordinate: {
      latitude: 45.497423,
      longitude: -73.579851,
    },
  },
  {
    name: "T Annex",
    coordinate: {
      latitude: 45.49671,
      longitude: -73.57927,
    },
  },
  {
    name: "Samuel Bronfman Building, SB Building",
    coordinate: {
      latitude: 45.4966,
      longitude: -73.58609,
    },
  },
  {
    name: "Toronto-Dominion Building",
    coordinate: {
      latitude: 45.494993,
      longitude: -73.578129,
    },
  },
  {
    name: "TU Tunnel",
    coordinate: {
      latitude: 45.49648,
      longitude: -73.578918,
    },
  },
  {
    name: "V Annex",
    coordinate: {
      latitude: 45.497101,
      longitude: -73.579907,
    },
  },
  {
    name: "Visual Art Building",
    coordinate: {
      latitude: 45.495543,
      longitude: -73.573795,
    },
  },
  {
    name: "X Annex",
    coordinate: {
      latitude: 45.49694,
      longitude: -73.579593,
    },
  },
  {
    name: "Z Annex",
    coordinate: {
      latitude: 45.496981,
      longitude: -73.579705,
    },
  },

  // Loyola Campus buildings latitude and longitude

  {
    name: "Administration Building",
    coordinate: {
      latitude: 45.457984,
      longitude: -73.639834,
    },
  },
  {
    name: "BB Annex",
    coordinate: {
      latitude: 45.459754,
      longitude: -73.639176,
    },
  },
  {
    name: "BH Annex",
    coordinate: {
      latitude: 45.459819,
      longitude: -73.639152,
    },
  },
  {
    name: "Central Building",
    coordinate: {
      latitude: 45.458204,
      longitude: -73.6403,
    },
  },
  {
    name: "Communication Studies and Journalism Building",
    coordinate: {
      latitude: 45.457478,
      longitude: -73.640354,
    },
  },
  {
    name: "Stinger Dome",
    coordinate: {
      latitude: 45.457656,
      longitude: -73.636098,
    },
  },
  {
    name: "F.C. Smith Building",
    coordinate: {
      latitude: 45.458493,
      longitude: -73.639287,
    },
  },
  {
    name: "Centre for Structural and Functional Genomics",
    coordinate: {
      latitude: 45.457017,
      longitude: -73.640432,
    },
  },
  {
    name: "Hingston Hall, wing HA",
    coordinate: {
      latitude: 45.459356,
      longitude: -73.64127,
    },
  },
  {
    name: "Hingston Hall, wing HB",
    coordinate: {
      latitude: 45.459162,
      longitude: -73.641962,
    },
  },
  {
    name: "Hingston Hall, wing HC",
    coordinate: {
      latitude: 45.458504,
      longitude: -73.643225,
    },
  },
  {
    name: "Applied Science Hub, HU Building",
    coordinate: {
      latitude: 45.458513,
      longitude: -73.641921,
    },
  },
  {
    name: "Jesuit Residence",
    coordinate: {
      latitude: 45.458504,
      longitude: -73.643225,
    },
  },
  {
    name: "PB Building",
    coordinate: {
      latitude: 45.456534,
      longitude: -73.638106,
    },
  },
  {
    name: "Oscar Peterson Concert Hall, PT Building",
    coordinate: {
      latitude: 45.459308,
      longitude: -73.638941,
    },
  },
  {
    name: "Perform Center",
    coordinate: {
      latitude: 45.457088,
      longitude: -73.637683,
    },
  },
    {
      name: "Physical Service",
      coordinate: {
        latitude: 45.459636,
        longitude: -73.639758,
      },
      address: "1455 de Maisonneuve Blvd W, Montreal, QC H3G 1M8"
    },
    {
      name: "Psychology Building",
      coordinate: {
        latitude: 45.458938,
        longitude: -73.640467,
      },
      address: "7141 Sherbrooke St W, Montreal, QC H4B 1R6"
    },
    {
      name: "Recreational and Athletics",
      coordinate: {
        latitude: 45.456677,
        longitude: -73.637523,
      },
      address: "7200 Sherbrooke St W, Montreal, QC H4B 1R6"
    },
    {
      name: "Loyola Jesuit Hall and Conference Center",
      coordinate: {
        latitude: 45.458551,
        longitude: -73.641016,
      },
      address: "7141 Sherbrooke St W, Montreal, QC H4B 1R6"
    },
    {
      name: "Student Center",
      coordinate: {
        latitude: 45.459137,
        longitude: -73.639203,
      },
      address: "1550 de Maisonneuve Blvd W, Montreal, QC H3G 1M8"
    },
    {
      name: "Solar House, SH Building",
      coordinate: {
        latitude: 45.459298,
        longitude: -73.642478,
      },
      address: "2200, rue Émery, Montreal, QC H3G 1M8"
    },
    {
      name: "Terrebonne Building, TA Building",
      coordinate: {
        latitude: 45.460051,
        longitude: -73.640842,
      },
      address: "1455 de Maisonneuve Blvd W, Montreal, QC H3G 1M8"
    },
    {
      name: "TB Annex",
      coordinate: {
        latitude: 45.459992,
        longitude: -73.640897,
      },
      address: "1455 de Maisonneuve Blvd W, Montreal, QC H3G 1M8"
    },
    {
      name: "Richard J. Renaud Science Complex",
      coordinate: {
        latitude: 45.457567,
        longitude: -73.641739,
      },
      address: "7141 Sherbrooke St W, Montreal, QC H4B 1R6"
    },
    {
      name: "Vanier Library",
      coordinate: {
        latitude: 45.459026,
        longitude: -73.638606,
      },
      address: "1400 de Maisonneuve Blvd W, Montreal, QC H3G 1M8"
    },
    {
      name: "Vanier Extension",
      coordinate: {
        latitude: 45.459026,
        longitude: -73.638606,
      },
      address: "1400 de Maisonneuve Blvd W, Montreal, QC H3G 1M8"
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
  