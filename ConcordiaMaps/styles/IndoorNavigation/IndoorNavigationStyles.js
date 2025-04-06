import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
    textAlign: "center",
    color: "#912338",
    paddingHorizontal: 16,
  },
  selectorsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  selectorWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  selector: {
    height: 100, // Reduced height to make room for POI filters
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
  },
  option: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedOption: {
    backgroundColor: "#ffe6e6",
  },
  optionText: {
    fontSize: 14,
  },
  button: {
    backgroundColor: "#912338",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginVertical: 8,
    marginHorizontal: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultContainerWrapper: {
    flex: 1,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  resultContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 16,
    maxHeight: 100, // Reduced for POI UI
  },
  resultContentContainer: {
    paddingBottom: 8,
  },
  pathContainer: {
    paddingHorizontal: 16,
  },
  pathStep: {
    marginVertical: 4,
  },
  stepText: {
    fontSize: 14,
  },
  arrow: {
    textAlign: "center",
    fontSize: 18,
    color: "#912338",
  },
  noPath: {
    fontStyle: "italic",
    color: "#666",
  },
  webViewContainer: {
    flex: 2, // Give it more space
    marginVertical: 10,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    overflow: "hidden",
  },
  webView: {
    flex: 1,
  },
  
  // New styles for POI features
  poiCategoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  poiCategoriesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },
  poiCategoriesScroll: {
    flexGrow: 0,
  },
  poiCategoriesContent: {
    paddingVertical: 4,
    paddingRight: 16,
  },
  poiCategoryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  poiCategoryText: {
    fontSize: 14,
    marginRight: 6,
  },
  poiLegendContainer: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  poiLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    margin: 4,
  },
  poiLegendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  poiLegendText: {
    fontSize: 12,
  },
  poiInfoModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  poiInfoModalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    elevation: 5,
  },
  poiInfoModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  poiInfoModalText: {
    fontSize: 14,
    marginBottom: 8,
  },
  poiInfoModalButton: {
    backgroundColor: "#912338",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 16,
  },
  poiInfoModalButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  poiToggleButton: {
    backgroundColor: "#444",
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
    marginVertical: 8,
    marginHorizontal: 16,
  },
  poiToggleButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default styles;