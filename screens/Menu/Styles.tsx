import { theme } from "@/providers/Theme";
import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
  container: {
    ...theme.setFont,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: theme.white,
  },
  title: {
    ...theme.setFont,
    fontSize: 20,
    marginBottom: 16,
    color: theme.mainApp,
  },
  menuItem: {
    ...theme.setFont,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomColor: theme.border,
    borderBottomWidth: 1,
    justifyContent: "space-between",
    padding: 16,
  },
  menuLeft: { ...theme.setFont, flexDirection: "row", alignItems: "center" },
  menuText: { ...theme.setFont, fontSize: 16, marginLeft: 15 },
  menuRight: { ...theme.setFont, flexDirection: "row", alignItems: "center" },
  badge: {
    ...theme.setFont,
    backgroundColor: "red",
    borderRadius: 12,
    paddingHorizontal: 6,
    marginRight: 8,
    alignItems: "center",
  },
  badgeText: {
    ...theme.setFont,
    color: theme.white,
    fontSize: 12,
    fontWeight: "bold",
  },
});

export { styles };
