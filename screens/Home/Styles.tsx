import { theme } from "@/providers/Theme";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    ...theme.setFont,
    paddingHorizontal: 16,
    backgroundColor: theme.white,
    flex: 1,
  },
  groupContainer: {
    ...theme.setFont,
    marginBottom: 16,
  },
  groupTitle: {
    ...theme.setFont,
    marginBottom: 8,
  },
  cardRow: {
    ...theme.setFont,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    ...theme.setFont,
    backgroundColor: theme.mainApp,
    padding: 12,
    borderRadius: 8,
    width: "30%",
    alignItems: "center",
  },
  cardCount: {
    ...theme.setFont,
    color: theme.white,
    fontSize: 28,
    marginVertical: 4,
  },
  cardText: {
    ...theme.setFont,
    color: theme.white,
    fontSize: 10,
    textAlign: "center",
  },
});

export { styles };
