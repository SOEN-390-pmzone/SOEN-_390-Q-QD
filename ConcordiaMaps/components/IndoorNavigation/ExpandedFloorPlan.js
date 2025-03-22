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
              source={{ html: htmlContent }}
              style={customStyles.expandedWebView || styles.expandedWebView}
              originWhitelist={["*"]}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              {...webViewProps}
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
