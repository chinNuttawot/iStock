import { theme } from "@/providers/Theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.white },
  header: {
    ...theme.setFont,
    paddingLeft: 16,
    flexDirection: "row",
    backgroundColor: theme.mainApp,
    alignItems: "center",
    paddingVertical: 16,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  textname: { ...theme.setFont, paddingLeft: 10 },
  avatarContainer: { ...theme.setFont, marginBottom: 8 },
  headerTitle: {
    ...theme.setFont,
    color: theme.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSubTitle: { ...theme.setFont, color: theme.white, fontSize: 14 },
  menuContainer: { ...theme.setFont, paddingHorizontal: 16, marginTop: 24 },
  menuItem: {
    ...theme.setFont,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    padding: 16,
  },
  menuLeft: { ...theme.setFont, flexDirection: "row", alignItems: "center" },
  menuText: { ...theme.setFont, fontSize: 16, marginLeft: 12 },
  footer: {
    ...theme.setFont,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 16,
  },
  versionText: { ...theme.setFont, color: "gray", fontSize: 12 },
});

export const stylesDeleteAccountScreen = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.white, padding: 16 },
  backButton: { marginTop: 16 },
  logo: { width: 300, height: 200, alignSelf: "center" },
  title: {
    ...theme.setFont,
    fontSize: 18,
    color: theme.mainApp,
    textAlign: "center",
    marginBottom: 16,
  },
  form: { marginTop: 16 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  input: {
    ...theme.setFont,
    flex: 1,
    marginLeft: 8,
  },
  button: {
    backgroundColor: theme.mainApp,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    ...theme.setFont,
    color: theme.white,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
