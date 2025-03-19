import { StyleSheet } from "react-native";

export const colors = {
  primary: "#912338",
  background: "#fff",
  cardBackground: "#f5f5f5",
  textDark: "#333",
  textMedium: "#666",
  textLight: "#888",
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMedium,
    textAlign: "center",
    marginBottom: 24,
  },
  scrollContainer: {
    flex: 1,
  },
  buildingCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buildingContent: {
    padding: 20,
  },
  textContainer: {
    gap: 8,
  },
  buildingName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textDark,
  },
  buildingCode: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
  },
  buildingDescription: {
    fontSize: 16,
    color: colors.textMedium,
    marginTop: 4,
  },
  buildingAddress: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
});