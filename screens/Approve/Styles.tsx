import { theme } from "@/providers/Theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    ...theme.setFont,
    flex: 1,
    color: theme.white,
    textAlign: "center",
    fontSize: 16,
  },
  content: {
    flexGrow: 1,
    padding: 16,
  },
  selectAllText: {
    ...theme.setFont,
    color: theme.mainApp,
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: theme.mainApp,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    ...theme.setFont_Bold,
    flex: 1,
    marginHorizontal: 8,
    color: theme.mainApp,
  },
  cardContent: {
    marginTop: 12,
  },
});
