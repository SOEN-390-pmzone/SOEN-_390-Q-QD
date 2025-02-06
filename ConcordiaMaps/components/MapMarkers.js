import React from "react";
import PropTypes from "prop-types";
import { View, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import styles from "../styles";

const customMarkerImage = require("../assets/PinLogo.png");

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
      latitude: 45.497777,
      longitude: -73.579531,
    },
  },
  {
    name: "LB Building",
    coordinate: {
      latitude: 45.49705,
      longitude: -73.578009,
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
      latitude: 45.497807,
      longitude: -73.579261,
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
      latitude: 45.496796,
      longitude: -73.579259,
    },
  },
  {
    name: "Toronto-Dominion Building",
    coordinate: {
      latitude: 45.495103,
      longitude: -73.578375,
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
      latitude: 45.459793,
      longitude: -73.639174,
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
      latitude: 45.457045,
      longitude: -73.638223,
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
      longitude:-73.64127,
    },
  },
  {
    name: "Hingston Hall, wing HB",
    coordinate: {
      latitude: 45.459308,
      longitude: -73.641849,
    },
  },
  {
    name: "Hingston Hall, wing HC",
    coordinate: {
      latitude: 45.459663,
      longitude: -73.64208,
    },
  },
  {
    name: "Jesuit Residence",
    coordinate: {
      latitude: 45.458432,
      longitude: -73.643235,
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
  },
  {
    name: "Psychology Building",
    coordinate: {
      latitude: 45.458938,
      longitude: -73.640467,
    },
  },
  {
    name: "Recreational and Athletics",
    coordinate: {
      latitude: 45.456677,
      longitude: -73.637523,
    },
  },
  {
    name: "Loyola Jesuit Hall and Conference Center",
    coordinate: {
      latitude: 45.458551,
      longitude: -73.641016,
    },
  },
  {
    name: "Student Center",
    coordinate: {
      latitude: 45.459131,
      longitude: -73.639251,
    },
  },
  {
    name: "Richard J. Renaud Science Complex",
    coordinate: {
      latitude: 45.457567,
      longitude: -73.641739,
    },
  },
  {
    name: "Vanier Library",
    coordinate: {
      latitude: 45.459026,
      longitude: -73.638606,
    },
  },
  {
    name: "Applied Schience Hub",
    coordinate: {
      latitude: 45.458513,
      longitude: -73.641921,
    },
  }
];

const MapMarkers = ({ children }) => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 45.4973, // Centering around SGW campus
          longitude: -73.5789,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Render child components (e.g., BuildingColoring) */}
        {children}

        {/* Render building markers */}
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
      </MapView>
    </View>
  );
};
MapMarkers.propTypes = {
  children: PropTypes.node,
};

export default MapMarkers;
