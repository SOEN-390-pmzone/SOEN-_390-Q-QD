import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
  TouchableOpacity,
} from "react-native";
import styles from "../styles/DirectionBox.style";
import PropTypes from "prop-types";

function DirectionsBox({
  directions = [],
  isCollapsed = true,
  setIsCollapsed = () => {},
}) {
  const [animation] = useState(new Animated.Value(isCollapsed ? 1 : 0));

  // This effect ensures the animation responds to isCollapsed prop changes
  useEffect(() => {
    Animated.timing(animation, {
      toValue: isCollapsed ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isCollapsed, animation]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300], // Moves most of the container down, leaving handle visible
  });

  // The google Maps API returns the directions with html syntax. It needs to be removed and added but parsed differently
  const parseHtmlInstructions = (htmlString) => {
    const parts = htmlString.split(/<\/?b>/).map((part) =>
      part
        .replace(/<div[^>]*>/gi, "")
        .replace(/<\/div>/gi, "")
        .replace(/<wbr[^>]*>/gi, ""),
    );
    return parts.map((part, index) => (
      <Text
        key={`instruction-part-${index}-${part.substring(0, 10)}`}
        style={index % 2 === 1 ? styles.boldText : styles.normalText}
      >
        {part}
      </Text>
    ));
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY }] }]}
      testID="directionsBox"
    >
      <TouchableOpacity
        onPress={toggleCollapse}
        style={styles.handle}
        testID="handle"
      >
        <View style={styles.handleBar} />
      </TouchableOpacity>
      <ScrollView style={styles.scrollView}>
        {directions.length > 0 ? (
          directions.map((direction, index) => (
            <View
              key={`direction-${index}-${direction.html_instructions.substring(0, 15)}`}
              style={styles.directionItem}
            >
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

DirectionsBox.propTypes = {
  directions: PropTypes.arrayOf(
    PropTypes.shape({
      html_instructions: PropTypes.string,
      distance: PropTypes.string,
    }),
  ),
  isCollapsed: PropTypes.bool,
  setIsCollapsed: PropTypes.func,
};

export default DirectionsBox;
