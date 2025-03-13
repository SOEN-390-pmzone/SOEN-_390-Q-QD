import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalScrollView: {
      flex: 1,
    },
    modalContent: {
      backgroundColor: "white",
      margin: 20,
      borderRadius: 20,
      padding: 20,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 20,
      color: "#912338",
    },
    selectionContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    selectorContainer: {
      flex: 1,
      marginHorizontal: 5,
    },
    selectorTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 10,
      color: "#333",
    },
    roomList: {
      maxHeight: 150,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
    },
    roomItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
    },
    selectedRoom: {
      backgroundColor: "#912338",
    },
    roomText: {
      fontSize: 16,
      color: "#333",
    },
    selectedRoomText: {
      color: "white",
    },
    floorPlansContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    floorPlanWrapper: {
      flex: 1,
      marginHorizontal: 5,
    },
    floorPlanTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 5,
    },
    floorPlanTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#333",
    },
    expandIcon: {
      marginLeft: 5,
      fontSize: 16,
      color: "#666",
    },
    webViewContainer: {
      height: 200,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      overflow: "hidden",
    },
    webView: {
      flex: 1,
    },
    navigationStepsContainer: {
      marginTop: 20,
      maxHeight: 200,
    },
    navigationSteps: {
      backgroundColor: "#f5f5f5",
      borderRadius: 8,
      padding: 10,
    },
    stepsTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
      color: "#333",
    },
    stepItem: {
      flexDirection: "row",
      marginBottom: 8,
      alignItems: "flex-start",
    },
    stepNumber: {
      fontSize: 16,
      fontWeight: "bold",
      marginRight: 8,
      color: "#912338",
    },
    stepText: {
      fontSize: 16,
      flex: 1,
      color: "#333",
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 20,
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      minWidth: 120,
    },
    calculateButton: {
      backgroundColor: "#912338",
    },
    closeButton: {
      backgroundColor: "#666",
    },
    buttonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
    },
    expandedModalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      justifyContent: "center",
      alignItems: "center",
    },
    expandedModalContent: {
      backgroundColor: "white",
      width: "95%",
      height: "90%",
      borderRadius: 20,
      padding: 20,
    },
    expandedHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    expandedTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#333",
    },
    closeExpandedButton: {
      padding: 5,
    },
    closeExpandedText: {
      fontSize: 30,
      color: "#666",
    },
    expandedWebViewContainer: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      overflow: "hidden",
    },
    expandedWebView: {
      flex: 1,
    },
  });

  export default styles;