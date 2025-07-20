import { theme } from "@/providers/Theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: theme.mainApp,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  mainText: { flexDirection: "row", alignItems: "center", padding: 5 },
  text: {
    ...theme.setFont,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    ...theme.setFont_Bold,
    color: theme.mainApp,
    fontSize: 16,
    flex: 1,
    marginLeft: 8,
  },
  cardContent: {
    marginTop: 8,
  },
  imageItem: {
    width: 120,
    height: 100,
    alignSelf: "center",
    marginTop: 16,
  },
});
