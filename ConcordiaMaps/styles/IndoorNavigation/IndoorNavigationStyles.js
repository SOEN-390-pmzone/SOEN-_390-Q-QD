import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 16,
    textAlign: "center",
    color: "#912338",
    paddingHorizontal: 16,
  },
  selectorsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  selectorWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  selector: {
    height: 120,
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
    marginBottom: 8,
  },
  resultContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 16,
    maxHeight: 200,
  },
  resultContentContainer: {
    paddingBottom: 16, // Add padding to the bottom of the content
  },
  pathContainer: {
    paddingHorizontal: 16,
  },
  pathStep: {
    marginVertical: 4,
  },
  stepText: {
    fontSize: 16,
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
    height: 300,
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
});

export default styles;
