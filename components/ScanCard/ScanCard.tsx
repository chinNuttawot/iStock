// components/ScanCard/ScanCard.tsx
import {
  emitter,
  filterScanOut,
  filterStockCheck,
  filterTransfer,
} from "@/common/emitter";
import ModalComponent from "@/providers/Modal";
import { Modeloption } from "@/providers/Modal/Model";
import { theme } from "@/providers/Theme";
import { deleteDocumentService } from "@/service";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
  menuType?: string;
  isSelected: boolean;
  isExpanded: boolean;
  isShowStatusForScanIn: boolean;
  isShowOnExpandBy: string;
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
      isShowOnExpandBy = "docNo",
      menuType,
    },
    ref
  ) => {
    const [confirmOpen, setConfirmOpen] = useState(false);
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

    const StatusForScanIn = (menuType: string) => {
      return (
        <View style={styles.mainStatus}>
          <Text style={[styles.text, { color: theme.white, fontSize: 10 }]}>
            {menuType}
          </Text>
        </View>
      );
    };

    const delDocNo = async (docNo: string, menuType: string) => {
      try {
        await deleteDocumentService(docNo);
        goEmitter(menuType);
      } catch (err) {
        Alert.alert("เกิดข้อผิดพลาด", "ลองใหม่อีกครั้ง");
      }
    };

    const goEmitter = (menuType: string) => {
      let dataToscreen: string = "";
      switch (menuType) {
        case "สแกนโอนย้าย":
          dataToscreen = filterTransfer;
          break;
        case "สแกนตรวจนับ":
          dataToscreen = filterStockCheck;
          break;
        case "สแกนออก":
          dataToscreen = filterScanOut;
          break;
      }
      emitter.emit(dataToscreen, {});
    };

    const RenderDeleteItem = (
      <View style={styles.mainView}>
        <Text style={styles.label}>{`คุณต้องการลบ "${docNo}" หรือไม่`}</Text>
      </View>
    );

    const optionModalComponent: Modeloption = {
      change: { label: "ยืนยัน", color: theme.red },
      changeCancel: {
        label: "ยกเลิก",
        color: theme.cancel,
        colorText: theme.black,
      },
    };

    const handleCancel = () => {
      setConfirmOpen(false);
    };

    return (
      <>
        <ModalComponent
          isOpen={confirmOpen}
          onChange={() => delDocNo(docNo, menuType as string)}
          option={optionModalComponent}
          onBackdropPress={handleCancel}
          onChangeCancel={handleCancel}
        >
          {RenderDeleteItem}
        </ModalComponent>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onLongPress={() => {
              if (status === "Open" && menuType !== "สแกนรับ") {
                setConfirmOpen(true);
              }
            }}
            onPress={() =>
              onExpand(isShowOnExpandBy === "docNo" ? docNo ?? "" : id ?? "")
            }
          >
            {!hideSelectedIds && (
              <Ionicons
                name={isSelected ? "checkbox" : "square-outline"}
                size={24}
                color={theme.mainApp}
                onPress={() =>
                  onSelect(
                    isShowOnExpandBy === "docNo" ? docNo ?? "" : id ?? ""
                  )
                }
              />
            )}

            <Text style={styles.cardTitle}>{docNo}</Text>
            {menuType && StatusForScanIn(menuType)}
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
          <View style={{ maxHeight: 200 }}>
            <ScrollView>
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
            </ScrollView>
          </View>
          {isExpanded && (
            <View style={styles.cardContent}>
              <Divider
                orientation="horizontal"
                style={{ marginVertical: 10 }}
              />

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
      </>
    );
  }
);

export default React.memo(ScanCard);

const styles = StyleSheet.create({
  mainStatus: {
    backgroundColor: theme.secondary,
    borderRadius: 100,
    padding: 8,
    marginRight: 10,
  },
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
