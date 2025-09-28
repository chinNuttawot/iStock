import { theme as appTheme, theme } from "@/providers/Theme";
import { Dimensions, Platform, StyleSheet } from "react-native";

const t: any = appTheme ?? {};
const W = Dimensions.get("window").width;

const color = {
  text: t.text ?? "#111827",
  textMuted: t.textGray ?? "#6B7280",
  primary: t.mainApp ?? "#2563EB",
  border: "rgba(0,0,0,0.06)",
  surface: "#FFFFFF",
  bannerBg: "#F3F4F6",
};

const radius = { xl: 22, banner: 16 };
const gap = 14;
const side = 18;

/** ใช้ 2 คอลัมน์ให้บาลานซ์กับจำนวนสเตตัส */
const columns = 3;
const cardWidth = (W - side * 3 - gap * (columns - 1)) / columns;

const shadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  android: { elevation: 6 },
});

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: side,
    backgroundColor: theme.secondary_2,
  },

  /** -------- HERO (พื้นหลังรูปด้านบน) -------- */
  heroWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: radius.banner,
    overflow: "hidden",
    backgroundColor: color.bannerBg,
    ...shadow,
    marginBottom: 18,
  },
  heroImage: {
    flex: 1,
    justifyContent: "flex-end",
  },
  heroImageRadius: {
    borderRadius: radius.banner,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  heroContent: {
    padding: 14,
  },
  heroTitle: {
    ...theme.setFont,
    color: "#FFFFFF",
    fontSize: 18,
  },
  heroSubtitle: {
    ...theme.setFont,
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 2,
  },

  /** -------- กลุ่มการ์ด -------- */
  groupContainer: {
    marginBottom: 28,
  },
  groupTitle: {
    ...theme.setFont,
    fontSize: 18,
    // fontWeight: "700",
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
  /** กรณีการ์ดสุดท้ายแล้วจำนวนทั้งหมดเป็นคี่ -> จัดกลางแถว */
  cardSingleCenter: {
    alignSelf: "center",
  },
  cardCount: {
    ...theme.setFont,
    fontSize: 28,
    color: color.text,
  },
  cardText: {
    ...theme.setFont,
    fontSize: 13,
    color: color.textMuted,
  },

  /** -------- misc -------- */
  spinnerWrap: {
    flex: 1,
    alignItems: "center",
    marginTop: 32,
  },
  scrollPad: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 24,
  },
});
