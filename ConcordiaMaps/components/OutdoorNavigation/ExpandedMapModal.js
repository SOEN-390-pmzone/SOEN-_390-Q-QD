import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import PropTypes from "prop-types";
import MapGenerationService from "../../services/MapGenerationService";

/**
 * Renders an expanded map modal for displaying map directions
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {function} props.onClose - Function to call when closing the modal
 * @param {Array} props.route - Route coordinates to display
 * @param {string} props.apiKey - Google Maps API key
 * @param {Object} props.styles - Styles object for component styling
 * @returns {JSX.Element|null} The expanded map component or null when not visible
 */
const ExpandedMapModal = ({ visible, onClose, route, apiKey, styles }) => {
  if (!visible) return null;

  return (
    <View style={styles.expandedModalOverlay} testID="modal-overlay">
      <View style={styles.expandedModalContent} testID="modal-content">
        <View style={styles.expandedHeader}>
          <Text style={styles.expandedTitle}>Map Directions</Text>
          <TouchableOpacity
            style={styles.closeExpandedButton}
            onPress={onClose}
          >
            <Text style={styles.closeExpandedText}>×</Text>
          </TouchableOpacity>
        </View>
        <WebView
          originWhitelist={["*"]}
          source={{
            html: MapGenerationService.generateMapHtml(route, apiKey),
          }}
          style={styles.expandedWebView}
        />
      </View>
    </View>
  );
};

// Add PropTypes validation
ExpandedMapModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  route: PropTypes.array.isRequired,
  apiKey: PropTypes.string.isRequired,
  styles: PropTypes.shape({
    expandedModalOverlay: PropTypes.object,
    expandedModalContent: PropTypes.object,
    expandedHeader: PropTypes.object,
    expandedTitle: PropTypes.object,
    closeExpandedButton: PropTypes.object,
    closeExpandedText: PropTypes.object,
    expandedWebView: PropTypes.object,
  }).isRequired,
};

export default ExpandedMapModal;
