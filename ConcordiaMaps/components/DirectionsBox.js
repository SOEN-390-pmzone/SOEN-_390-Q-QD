import React, { useState,useEffect } from "react";
import { View, Text, ScrollView, Animated, TouchableOpacity } from "react-native";

function DirectionsDropdown({directions = []}) {

//? ANIMATION ONLY
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [animation] = useState(new Animated.Value(1));

   // Run initial animation when component mounts
   useEffect(() => {
    Animated.timing(animation, {
      toValue: isCollapsed ? 1 : 0,
      duration: 0, // Immediate for initial state
      useNativeDriver: true,
    }).start();
  }, []);


  const toggleCollapse = () => {
    Animated.timing(animation, {
      toValue: isCollapsed ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsCollapsed(!isCollapsed));
  };

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300], // Moves most of the container down, leaving handle visible
  });

  //! TODO : Fix parsing for other cases such as <div> or <li>... are there others?
  // The google Maps API returns the directions with html syntax. It needs to be removed and added but parsed differently
  const parseHtmlInstructions = (htmlString) => {
    // Remove <b> tags but keep their content with different styling
    const parts = htmlString.split(/<\/?b>/);
    return parts.map((part, index) => (
      <Text key={index} style={index % 2 === 1 ? styles.boldText : styles.normalText}>
        {part}
      </Text>
    ));
  };

  return (
    <Animated.View 
      style={[styles.container, { transform: [{ translateY }] }]}
    >
      <TouchableOpacity onPress={toggleCollapse} style={styles.handle}>
        <View style={styles.handleBar} />
      </TouchableOpacity>
      <ScrollView style={styles.scrollView}>
        {directions.length > 0 ? (
          directions.map((direction, index) => (
            <View key={index} style={styles.directionItem}>
              <View style={styles.instructionContainer}>
                {parseHtmlInstructions(direction.html_instructions)}
              </View>
              <Text style={styles.distanceText}>{direction.distance}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.directionItem}>No directions available</Text>
        )}
      </ScrollView>
    </Animated.View>
  );
}

export default DirectionsBox;