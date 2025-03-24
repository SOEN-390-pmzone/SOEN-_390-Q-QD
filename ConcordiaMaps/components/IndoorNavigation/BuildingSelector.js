import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Header from "../Header";
import NavBar from "../NavBar";
import FloorRegistry from "../../services/BuildingDataService";
import styles from "../../styles/IndoorNavigation/BuildingSelectorStyles";

const BuildingSelector = () => {
  const navigation = useNavigation();
  //To get the data from the list of all available buildings
  const BUILDINGS = FloorRegistry.getBuildings();

  const handleBuildingSelect = (buildingId) => {
    // Find the corresponding key in the FloorRegistry by matching the building data
    const buildingTypes = Object.keys(FloorRegistry.getAllBuildings());
    const buildingType = buildingTypes.find(
      (key) => FloorRegistry.getBuilding(key).id === buildingId,
    );

    if (buildingType) {
      navigation.navigate("FloorSelector", { buildingType });
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Select Building</Text>
        <ScrollView
          style={styles.buildingsContainer}
          showsVerticalScrollIndicator={true}
          testID="buildings-scroll-view"
        >
          {BUILDINGS.map((building) => (
            <TouchableOpacity
              key={building.id}
              style={styles.buildingCard}
              onPress={() => handleBuildingSelect(building.id)}
            >
              <View style={styles.buildingContent}>
                <View style={styles.textContainer}>
                  <Text style={styles.buildingName}>{building.name}</Text>
                  <Text style={styles.buildingCode}>{building.code}</Text>
                  <Text style={styles.buildingDescription}>
                    {building.description}
                  </Text>
                  <Text style={styles.buildingAddress}>{building.address}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default BuildingSelector;
