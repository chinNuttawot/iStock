import { theme } from "@/providers/Theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  /** ใช้กับโมดัลยืนยัน (ลบ/ออกจากหน้า) */
  mainView: {
    width: "100%",
    alignItems: "center",
    height: 100,
    justifyContent: "center",
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
  input: { ...theme.setFont, flex: 1, marginLeft: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },

  /** ใช้กับโมดัลแก้ไข */
  editMain: {
    width: "100%",
    padding: 16,
    paddingBottom: 24, // กันปุ่มชิดขอบล่าง
    // maxHeight: "80%", // (ตัวเลือก) ถ้าอยากจำกัดความสูงไม่ให้เกินจอ
    // maxWidth: 520,    // (ตัวเลือก) ถ้าอยากล็อกความกว้าง
    // alignSelf: "center",
    gap: 12,
  },
  metaBox: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 10,
  },
  metaLine: {
    ...theme.setFont,
    color: "#374151",
    marginBottom: 2,
  },
  fieldGroup: {
    marginTop: 4,
  },
  fieldLabel: {
    ...theme.setFont,
    marginBottom: 6,
    color: "#374151",
  },
  inputBox: {
    color: theme.text,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.background,
    ...theme.setFont,
  },
  btnRow: {
    flexDirection: "row",
    marginTop: 8,
  },
});
