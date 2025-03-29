import React from "react";
import { TouchableOpacity, Image } from "react-native";
import PropTypes from "prop-types"; // Add this import
import styles from "../../styles/MultistepNavigation/NavigationStepStyles";

/**
 * A reusable navigation step component that displays an image based on type
 * @param {string} title - Step title (for accessibility)
 * @param {string} description - Step description (for accessibility)
 * @param {function} onPress - Function to call when step is pressed
 * @param {string} type - Either 'indoor' or 'outdoor' to determine image type
 * @param {string} buildingId -Either 'hall', 've','vl','jmsb'
 */
const NavigationStep = ({
  title,
  description,
  onPress,
  type = "outdoor",
  buildingId,
}) => {
  // Determine which image to load based on type and buildingId
  const getImageSource = () => {
    if (type === "outdoor") {
      return require("../../assets/Navigation/outdoor.png");
    } else if (type === "indoor" && buildingId) {
      // Dynamically select image based on buildingId
      switch (buildingId.toLowerCase()) {
        case "hall":
          return require("../../assets/Navigation/hall.png");
        case "vl":
          return require("../../assets/Navigation/vl.png");
        case "ve":
          return require("../../assets/Navigation/ve.png");
        case "jmsb":
          return require("../../assets/Navigation/jmsb.png");
        default:
          //Return this as a default
          return require("../../assets/Navigation/outdoor.png");
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      accessible={true}
      accessibilityLabel={`${title}: ${description}`}
    >
      <Image
        source={getImageSource()}
        style={styles.stepImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
};

// Add PropTypes validation
NavigationStep.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  type: PropTypes.oneOf(["indoor", "outdoor"]),
  buildingId: PropTypes.oneOf(["hall", "ve", "vl", "jmsb"]),
};

// Define default props
NavigationStep.defaultProps = {
  type: "outdoor",
};

export default NavigationStep;
