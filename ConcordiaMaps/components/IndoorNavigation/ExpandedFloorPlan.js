import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import PropTypes from "prop-types";
import styles from "../../styles/IndoorNavigation/InterfloorNavigationStyles";

const ExpandedFloorPlanModal = ({
  visible,
  floorNumber,
  onClose,
  htmlContent,
  webViewProps = {},
  customStyles = {},
}) => {
  // Extract the key prop from webViewProps to avoid the React warning
  const { key, ...restWebViewProps } = webViewProps;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={customStyles.expandedModalOverlay || styles.expandedModalOverlay}
      >
        <View
          style={
            customStyles.expandedModalContent || styles.expandedModalContent
          }
        >
          <View style={customStyles.expandedHeader || styles.expandedHeader}>
            <Text style={customStyles.expandedTitle || styles.expandedTitle}>
              Floor {floorNumber}
            </Text>
            <TouchableOpacity
              style={
                customStyles.closeExpandedButton || styles.closeExpandedButton
              }
              onPress={onClose}
            >
              <Text
                style={
                  customStyles.closeExpandedText || styles.closeExpandedText
                }
              >
                ×
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={
              customStyles.expandedWebViewContainer ||
              styles.expandedWebViewContainer
            }
          >
            <WebView
              key={key} // Pass key directly, not through the spread operator
              source={{ html: htmlContent }}
              style={customStyles.expandedWebView || styles.expandedWebView}
              originWhitelist={["*"]}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              {...restWebViewProps} // Spread the rest of the props
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

ExpandedFloorPlanModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  floorNumber: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  htmlContent: PropTypes.string.isRequired,
  webViewProps: PropTypes.object,
  customStyles: PropTypes.object,
};

export default ExpandedFloorPlanModal;
