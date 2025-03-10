import React from "react";
import { Polygon, Marker } from "react-native-maps";
import { coloringData } from "../data/coloringData.js";

const BuildingColoring = () => {
  return (
    <>
      {coloringData.features.map((feature, index) => {
        const { geometry, properties } = feature;

        // Create a unique key using properties if available, or fallback to a composite key
        const uniqueKey =
          properties.id ||
          properties.name ||
          `${geometry.type}-${properties.code || ""}-${index}`;

        if (geometry.type === "Polygon") {
          const coordinates = geometry.coordinates[0].map((coord) => ({
            latitude: coord[1],
            longitude: coord[0],
          }));

          return (
            <Polygon
              key={uniqueKey}
              coordinates={coordinates}
              fillColor="rgba(255, 0, 0, 0.5)"
              strokeColor="rgba(255, 0, 0, 1)"
              strokeWidth={1}
            />
          );
        }

        if (geometry.type === "Point") {
          return (
            <Marker
              key={uniqueKey}
              coordinate={{
                latitude: geometry.coordinates[1],
                longitude: geometry.coordinates[0],
              }}
              title={properties.name}
            />
          );
        }

        return null;
      })}
    </>
  );
};

export default BuildingColoring;
