import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  formContainer: {
    padding: 24,
  },
  header: {
    marginBottom: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#912338", // Concordia maroon
    marginBottom: 4,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 0,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    height: 56,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchBarFocused: {
    borderColor: "#912338",
    borderWidth: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
    marginLeft: 8,
  },
  icon: {
    color: "#666666",
  },
  predictionsList: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    maxHeight: 200,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  predictionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  predictionText: {
    flex: 1,
    fontSize: 15,
    color: "#333333",
    marginLeft: 12,
  },
  roomInput: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333333",

    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  suggestionsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    maxHeight: 200,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  suggestionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionText: {
    fontSize: 16,
    color: "#333333",

    marginBottom: 4,
  },
  suggestionAddress: {
    fontSize: 14,
    color: "#666666",
  },
  button: {
    backgroundColor: "#912338",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContainer: {
    flex: 1,
    padding: 15,
  },
  content: {
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginVertical: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  navigationContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 100,
  },
  transitionInfoContainer: {
    padding: 15,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
  },
  transitionInfoText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  transportIconContainer: {
    marginVertical: 15,
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 50,
  },
  floorTransitionIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  floorIndicator: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#912338",
  },
  transitionArrowContainer: {
    marginHorizontal: 10,
  },
  visualizeButton: {
    backgroundColor: "#912338",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 10,
  },
  visualizeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  stepProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  buildingIndicator: {
    alignItems: "center",
    padding: 5,
    minWidth: 80,
  },
  buildingName: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 3,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#cccccc",
    marginHorizontal: 5,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  navigationButton: {
    backgroundColor: "#912338",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110, // Slightly smaller but still accessible
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, // Increased for more visibility
    shadowRadius: 4,
    elevation: 5, // Increased for more visibility
    marginHorizontal: 10, // Add horizontal margins
  },
  navigationButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 8,
  },

  navigationButtonsContainer: {
    width: "110%", // Ensure the buttons take full width
    paddingVertical: 16,
    backgroundColor: "#f5f5f5", // Change from transparent to match background
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    position: "absolute", // Position at the bottom
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10, // Ensure visibility
  },

  navigationButtonDisabled: {
    backgroundColor: "#cccccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  stepCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    marginVertical: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  indoorNavButton: {
    backgroundColor: "#912338",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
  },
  indoorNavButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  indoorInfoContainer: {
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 15,
  },
  indoorNavigationContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    margin: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  indoorNavigationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  indoorNavigationTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeIndoorButton: {
    padding: 5,
  },
  floorPlansContainer: {
    flexDirection: "column",
    marginBottom: 16,
  },
  floorPlanSection: {
    marginBottom: 16,
  },
  floorPlanTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  floorPlanWebViewContainer: {
    height: 250,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    overflow: "hidden",
  },
  floorPlanWebView: {
    flex: 1,
  },
  navigationStepsList: {
    flex: 1,
  },
  navigationStepsTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  stepsList: {
    flex: 1,
    maxHeight: 250,
  },
  navigationStepItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  stepIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  stepNumber: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  stepInstructionText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  indoorPreviewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#912338",
    backgroundColor: "white",
  },
  indoorPreviewButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#912338",
    marginRight: 8,
  },
  indoorInfoText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  indoorDetailsText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 12,
  },
  stepContentContainer: {
    marginTop: 8,
  },
  navigationControls: {
    flexDirection: "row",
    justifyContent: "space-around", // Changed to space-around for better centering
    alignItems: "center", // Add this to center vertically
    marginTop: 10, // Reduced from 20
    marginBottom: 10, // Reduced from 24
    paddingHorizontal: 16,
    width: "100%", // Ensure the controls take full width
  },

  // Map styles
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    marginBottom: 8,
  },
  mapWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  mapWebView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  expandButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    padding: 8,
    zIndex: 10,
  },
  expandButtonText: {
    fontSize: 14,
    color: "#912338",
    fontWeight: "600",
  },

  // Floor plan styles
  floorPlanContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    marginBottom: 8,
  },
  floorPlanWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  floorPlanWebView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  floorSelectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 4,
  },
  floorSelectorLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginRight: 8,
  },
  floorSelector: {
    flexDirection: "row",
  },
  floorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  floorButtonActive: {
    backgroundColor: "#912338",
    borderColor: "#912338",
  },
  floorButtonText: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "600",
  },
  floorButtonTextActive: {
    color: "#ffffff",
  },

  // Direction list styles
  directionsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  directionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  directionsList: {
    maxHeight: 160,
  },
  directionItem: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "flex-start",
  },
  directionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#912338",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 24,
    marginRight: 12,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  directionContent: {
    flex: 1,
  },
  directionText: {
    fontSize: 15,
    color: "#333333",
    lineHeight: 22,
  },
  distanceText: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  noDirectionsText: {
    fontSize: 16,
    color: "#666666",
    fontStyle: "italic",
    textAlign: "center",
    padding: 16,
  },

  // Expanded view styles
  expandedModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  expandedModalContent: {
    width: width * 0.9,
    height: height * 0.8,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
  },
  expandedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  expandedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  closeExpandedButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeExpandedText: {
    fontSize: 24,
    color: "#333333",
    fontWeight: "bold",
    lineHeight: 30,
  },
  expandedWebView: {
    flex: 1,
  },
  // Room information banner
  roomInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#912338",
  },

  roomInfoText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    color: "#333333",
  },
  // Loading states
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },

  loadingText: {
    marginTop: 10,
    color: "#666666",
    fontSize: 14,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#EAEAEA",
    borderRadius: 8,
    overflow: "hidden",
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    minWidth: 80,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#912338",
  },
  toggleText: {
    fontSize: 12,
    color: "#666",
  },
  toggleTextActive: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    width: width * 0.92,
    maxHeight: height * 0.8,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  closeModalButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeModalText: {
    fontSize: 18,
    color: "#333333",
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 30,
  },
  indoorStepsPreview: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  indoorStepsPreviewTitle: {
    fontWeight: "bold",
    marginBottom: 6,
    fontSize: 14,
    color: "#333",
  },
  previewStepsList: {
    marginTop: 4,
  },
  previewStepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  previewStepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  previewStepText: {
    flex: 1,
    fontSize: 13,
    color: "#333",
  },
  moreStepsText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },
  noStepsText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    padding: 10,
  },
});

export default styles;
