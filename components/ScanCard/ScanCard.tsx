// components/ScanCard/ScanCard.tsx
import { theme } from "@/providers/Theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Divider } from "react-native-elements";
import CustomButton from "../CustomButton";
import UploadPicker from "../UploadPicker"; // ✅ import handle

export type StatusType = "Open" | "Pending Approval" | "Approved" | "Rejected";

type ScanCardProps = {
  id?: string;
  docNo: string;
  date: string;
  details: { label: string; value: string }[];
  status?: StatusType | null;
  isSelected: boolean;
  isExpanded: boolean;
  isShowStatusForScanIn: boolean;
  onSelect: (docNo: string) => void;
  onExpand: (docNo: string) => void;
  goTo?: () => void;
  hideSelectedIds?: boolean;
  selectedIds?: string[];
  keyRef1?: any;
  keyRef2?: any;
  keyRef3?: any;
  remark?: any;
  hideAddFile: boolean;
};

// ✅ ref = UploadPickerHandle (ไม่ใช่ View)
const ScanCard = React.forwardRef<any, ScanCardProps>(
  (
    {
      id,
      keyRef1,
      keyRef2,
      keyRef3,
      remark,
      docNo,
      details,
      status,
      isSelected,
      isExpanded,
      selectedIds,
      onSelect,
      onExpand,
      goTo,
      hideSelectedIds = false,
      hideAddFile = false,
      isShowStatusForScanIn = false,
      date,
    },
    ref
  ) => {
    const renderStatusIcon = () => {
      switch (status) {
        case "Open":
          return (
            <Ionicons name="document-outline" size={24} color={theme.black} />
          );
        case "Pending Approval":
          return (
            <Ionicons name="time-outline" size={24} color={theme.orange} />
          );
        case "Approved":
          return (
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color={theme.green}
            />
          );
        case "Rejected":
          return (
            <Ionicons name="close-circle-outline" size={24} color={theme.red} />
          );
        default:
          return null;
      }
    };

    const StatusForScanIn = () => {
      return (
        <View style={styles.mainStatus}>
          <Text style={[styles.text, { color: theme.white, fontSize: 10 }]}>
            {"กรอกรายละเอียด"}
          </Text>
        </View>
      );
    };

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => onExpand(docNo)}
        >
          {!hideSelectedIds && (
            <Ionicons
              name={isSelected ? "checkbox" : "square-outline"}
              size={24}
              color={theme.mainApp}
              onPress={() => onSelect(docNo)}
            />
          )}

          <Text style={styles.cardTitle}>{docNo}</Text>
          {isShowStatusForScanIn && StatusForScanIn()}
          {renderStatusIcon()}

          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color={theme.mainApp}
          />
        </TouchableOpacity>
        <Text style={[styles.text, { marginTop: 8, marginLeft: 8 }]}>
          {date}
        </Text>
        <UploadPicker
          hideAddFile={hideAddFile}
          ref={ref}
          keyRef1={keyRef1}
          keyRef2={keyRef2}
          keyRef3={keyRef3}
          remark={remark}
          insideScrollView
          fieldName="file"
          allowsMultiple
          onAllUploaded={(items) => {
            // TODO: handle uploaded items
          }}
        />
        {isExpanded && (
          <View style={styles.cardContent}>
            <Divider orientation="horizontal" style={{ marginVertical: 10 }} />

            {details.map((item, index) => (
              <View style={styles.mainText} key={index}>
                <Text style={[styles.text, { width: 90 }]}>{item.label}</Text>
                <Text style={[styles.text, { width: 10 }]}>:</Text>
                <Text style={[styles.text, { width: "70%" }]}>
                  {item.value}
                </Text>
              </View>
            ))}

            <View style={{ paddingHorizontal: 120, marginTop: 32 }}>
              <CustomButton
                label="ดูรายการ"
                disabled={(selectedIds?.length ?? 0) > 0}
                onPress={() => goTo?.()}
              />
            </View>
          </View>
        )}
      </View>
    );
  }
);

export default React.memo(ScanCard);

const styles = StyleSheet.create({
  mainStatus: {
    backgroundColor: theme.orange,
    borderRadius: 100,
    padding: 8,
    marginRight: 10,
  },
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
});
