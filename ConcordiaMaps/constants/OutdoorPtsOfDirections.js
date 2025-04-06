const restaurantMarker = require("../assets/restoICON.png");
const cafeMarker = require("../assets/cafeICON.png");
const parkMarker = require("../assets/parkICON.png");
const storeMarker = require("../assets/storeICON.png");

export const PointsOfInterest = [
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
  {
    name: "Raku",
    coordinate: { latitude: 45.46041076810318, longitude: -73.63561362331475 },
    address: "6929 Sherbrooke St W, Montreal, Quebec H4B 1P8",
    markerImage: restaurantMarker,
  },
  {
    name: "Loyola Park",
    coordinate: { latitude: 45.46121016288844, longitude: -73.64596844799468 },
    address: "4877 Av. Doherty, Montréal, QC H4V 2B2",
    markerImage: parkMarker,
  },
  {
    name: "Chicago Pizza",
    coordinate: { latitude: 45.45300050371994, longitude: -73.6460230368441 },
    address: "54 Westminster Ave N, Montreal West, Quebec H4X 1Z2",
    markerImage: restaurantMarker,
  },
  {
    name: "RESTAURANT TESFU",
    coordinate: { latitude: 45.453654351956224, longitude: -73.63725347582756 },
    address: "7427 Rue Saint-Jacques, Montréal, QC H4B 1Y2",
    markerImage: restaurantMarker,
  },
  {
    name: "Hingston Cafe",
    coordinate: { latitude: 45.459321334818476, longitude: -73.64163638016397 },
    address: "7141 Sherbrooke St W, Montreal, Quebec H4B 1R6",
    markerImage: cafeMarker,
  },
  {
    name: "Second Cup Café",
    coordinate: { latitude: 45.45610103268165, longitude: -73.64082945641897 },
    address: "7335-7345 Sherbrooke St W, Montreal, Quebec H4B 1R9",
    markerImage: cafeMarker,
  },
  {
    name: "Couche-Tard",
    coordinate: { latitude: 45.46063658996555, longitude: -73.63556785904616 },
    address: "6905 Sherbrooke St W, Montreal, Quebec H4B 1P8",
    markerImage: storeMarker,
  },
  {
    name: "Infinite",
    coordinate: { latitude: 45.45576662226191, longitude: -73.64108986672184 },
    address: "7363 Sherbrooke St W, Montreal, Quebec H4B 1S1",
    markerImage: cafeMarker,
  },
];
