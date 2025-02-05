import React from "react";
import { Polygon } from "react-native-maps";

const geojson = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          [
            [-73.57955713111238, 45.49653030013195],
            [-73.5796681923123, 45.49641352707994],
            [-73.57957431915551, 45.4963625546406],
            [-73.57966422584043, 45.49626617026453],
            [-73.5794725130558, 45.496174419599356],
            [-73.57925435712785, 45.49639313811011],
            [-73.57955713111238, 45.49653030013195]
          ]
        ],
        "type": "Polygon"
      }
    }
  ]
};

const BuildingColoring = () => {
  return (
    <>
      {geojson.features.map((feature, index) => {
        if (feature.geometry.type === "Polygon") {
          const coordinates = feature.geometry.coordinates[0].map((coord) => ({
            latitude: coord[1],
            longitude: coord[0],
          }));

          return (
            <Polygon
              key={index}
              coordinates={coordinates}
              fillColor="rgba(255, 0, 0, 0.5)" // Red fill with 50% opacity
              strokeColor="rgba(255, 0, 0, 1)" // Red border
              strokeWidth={1}
            />
          );
        }
        return null;
      })}
    </>
  );
};

export default BuildingColoring;
