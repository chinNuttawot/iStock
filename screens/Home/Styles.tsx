// ./Styles.ts
import { theme as appTheme, theme } from "@/providers/Theme";
import { Dimensions, Platform, StyleSheet } from "react-native";

const t: any = appTheme ?? {};
const W = Dimensions.get("window").width;

const color = {
  text: t.text ?? "#111827",
  textMuted: t.textGray ?? "#6B7280",
  primary: t.mainApp ?? "#2563EB",
  border: "rgba(255,255,255,0.2)",
  surface: "rgba(255, 255, 255, 1)", // โปร่งใสให้เห็น bg
};

const radius = { xl: 22 };
const gap = 14;
const cardWidth = (W - 36 - gap) / 2;

const shadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  android: { elevation: 5 },
});

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    backgroundColor: theme.secondary_2
  },
  groupContainer: {
    marginBottom: 28,
  },
  groupTitle: {
     ...theme.setFont,
    fontSize: 18,
    fontWeight: "700",
    color: color.text,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: gap,
    rowGap: gap,
  },
  card: {
    width: cardWidth,
    minHeight: 116,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    padding: 14,
    justifyContent: "space-between",
    ...shadow,
  },
  iconPill: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginBottom: 6,
  },
  cardCount: {
    ...theme.setFont,
    fontSize: 28,
    fontWeight: "800",
    color: color.text,
  },
  cardText: {
    ...theme.setFont,
    fontSize: 13,
    fontWeight: "600",
    color: color.textMuted,
  },
  spinnerWrap: {
    flex: 1,
    alignItems: "center",
    marginTop: 32,
  },
  scrollPad: {
    flexGrow: 1,
    paddingTop: 16,
  },
});
