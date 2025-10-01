import { theme } from "@/providers/Theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    ...theme.setFont,
    marginBottom: 4,
  },
  Sublabel: {
    ...theme.setFont,
    color: theme.mainApp,
    fontSize: 20,
    marginBottom: 4,
  },
  card: {
    borderWidth: 1,
    borderColor: theme.mainApp,
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    ...theme.setFont_Bold,
    color: theme.mainApp,
  },
  cardContent: {
    marginTop: 8,
  },
  input: { ...theme.setFont, flex: 1, marginLeft: 8, color: theme.text },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
});
