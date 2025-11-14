import {
  emitter,
  filterApprove,
  filterApproveDetail,
  filterCreateDocumentScanOut,
  filterCreateDocumentStockCheck,
  filterCreateDocumentTransfer,
  filterScanIn,
  filterScanInDetail,
  filterScanOut,
  filterScanOutDetail,
  filterStockCheck,
  filterStockCheckDetail,
  filterTransactionHistory,
  filterTransactionHistoryDetail,
  filterTransfer,
  filterTransferDetail,
} from "@/common/emitter";
import CustomButton from "@/components/CustomButton";
import CustomDatePicker from "@/components/CustomDatePicker";
import Header from "@/components/Header";
import ScannerModal from "@/components/Scanner";
import { theme } from "@/providers/Theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SelectList } from "react-native-dropdown-select-list";

// helper แปลง Date -> string รูปแบบ th-TH
const formatThDate = (date: Date) => {
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// helper แปลง string รูปแบบ th-TH (dd/MM/yyyy, พ.ศ.) -> Date
const parseThDateString = (value: string | undefined | null): Date | null => {
  if (!value) return null;
  const parts = value.split("/");
  if (parts.length !== 3) return null;

  const [dayStr, monthStr, yearStr] = parts;
  const day = Number(dayStr);
  const month = Number(monthStr);
  const yearTh = Number(yearStr);

  if (!day || !month || !yearTh) return null;

  // ปีไทย -> ค.ศ.
  const year = yearTh - 543;
  return new Date(year, month - 1, day);
};

export default function FilterScreen() {
  const [docNo, setDocumentNo] = useState("");
  const [selectTextDate, setSelectTextDate] = useState<"start" | "end" | "">(
    ""
  );
  const [stockOutStartDate, setDocumentStartDate] = useState("");
  const [stockOutEndDate, setDocumentEndDate] = useState("");
  const [status, setStatus] = useState("All");
  const [menuId, setDocType] = useState("All");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigation = useNavigation<any>();
  const routes = navigation.getState().routes;
  const prevRoute = routes[routes.length - 2];

  const route = useRoute();
  const {
    filter,
    showFilterDoc = true,
    showFilterDate = true,
    showFilterStatus = true,
    showFilterReset = true,
    isTypeDoc = false,
    ScanName = "เลขที่เอกสาร",
    statusName = "สถานะเอกสาร",
    textSearch = "ค้นหา",
    statusOptions = [
      { key: "All", value: "All" },
      { key: "Open", value: "Open" },
      { key: "Pending Approval", value: "Pending Approval" },
      { key: "Approved", value: "Approved" },
      { key: "Rejected", value: "Rejected" },
    ],
    TypeDocOptions = [],
  } = route.params as {
    filter: any;
    showFilterDoc: boolean;
    showFilterDate: boolean;
    showFilterStatus: boolean;
    showFilterReset: boolean;
    isTypeDoc: boolean;
    ScanName?: string;
    statusName?: string;
    textSearch?: string;
    statusOptions?: any;
    TypeDocOptions?: any;
  };

  useEffect(() => {
    if (filter) {
      setStatus(filter?.status);
      setDocumentStartDate(filter?.stockOutStartDate);
      setDocumentEndDate(filter?.stockOutEndDate);
      setDocumentNo(filter?.docNo);
      setDocType(filter?.menuId);
    }
  }, []);

  useEffect(() => {
    if (showFilterDate) {
      // future use
    }
  }, [showFilterDate]);

  const resetFilterForm = () => {
    Promise.all([
      setDocumentNo(""),
      setDocumentStartDate(""),
      setDocumentEndDate(""),
      setStatus("All"),
      setDocType("All"),
    ]);
    const parmas = {
      status: "All",
      stockOutDate: "",
      docNo: "",
      menuId: "",
      isFilter: false,
      isReset: true,
    };
    goEmitter(parmas);
    navigation.goBack();
  };

  const goEmitter = (item: any) => {
    let dataToscreen: string = "";
    console.log("prevRoute.name ====>", prevRoute.name);

    switch (prevRoute.name) {
      case "ScanIn":
        dataToscreen = filterScanIn;
        break;
      case "ScanInDetail":
        dataToscreen = filterScanInDetail;
        break;
      case "TransactionHistory":
        dataToscreen = filterTransactionHistory;
        break;
      case "TransactionHistoryDetail":
        dataToscreen = filterTransactionHistoryDetail;
        break;
      case "Transfer":
        dataToscreen = filterTransfer;
        break;
      case "TransferDetail":
        dataToscreen = filterTransferDetail;
        break;
      case "StockCheck":
        dataToscreen = filterStockCheck;
        break;
      case "StockCheckDetail":
        dataToscreen = filterStockCheckDetail;
        break;
      case "Approve":
        dataToscreen = filterApprove;
        break;
      case "ApproveDetail":
        dataToscreen = filterApproveDetail;
        break;
      case "ScanOut":
        dataToscreen = filterScanOut;
        break;
      case "ScanOutDetail":
        dataToscreen = filterScanOutDetail;
        break;
      case "CreateDocumentScanOut":
        dataToscreen = filterCreateDocumentScanOut;
        break;
      case "CreateDocumentStockCheck":
        dataToscreen = filterCreateDocumentStockCheck;
        break;
      case "CreateDocumentTransfer":
        dataToscreen = filterCreateDocumentTransfer;
        break;
    }
    console.log("item ==>", item);

    emitter.emit(dataToscreen, item);
  };

  const onSearch = () => {
    const parmas = {
      status,
      stockOutStartDate,
      stockOutEndDate,
      docNo,
      menuId,
      isFilter: true,
      isReset: false,
    };
    goEmitter(parmas);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.white }}>
      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
        title="filter"
      />

      <ScrollView contentContainerStyle={styles.content}>
        {showFilterDoc && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{ScanName}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={docNo}
                onChangeText={setDocumentNo}
                style={styles.input}
                placeholder=""
                placeholderTextColor={theme.border}
              />
              <TouchableOpacity onPress={() => setShowScanner(true)}>
                <Ionicons name="scan-outline" size={20} color={theme.gray} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {showFilterDate && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>วันที่ของสินค้า</Text>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                marginTop: 10,
              }}
            >
              <View style={{ flex: 1, flexDirection: "column" }}>
                <Text style={styles.label}>เริ่ม</Text>
                <TouchableOpacity
                  style={{ ...styles.inputWrapper, flex: 1, marginRight: 8 }}
                  onPress={() => {
                    setSelectTextDate("start");
                    setShowDatePicker(true);
                  }}
                >
                  <TextInput
                    value={stockOutStartDate}
                    editable={false}
                    style={styles.input}
                    placeholder=""
                    placeholderTextColor={theme.border}
                  />
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={theme.gray}
                  />
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1, flexDirection: "column" }}>
                <Text style={[styles.label, { marginLeft: 8 }]}>สิ้นสุด</Text>
                <TouchableOpacity
                  style={{ ...styles.inputWrapper, flex: 1, marginLeft: 8 }}
                  onPress={() => {
                    setSelectTextDate("end");
                    setShowDatePicker(true);
                  }}
                >
                  <TextInput
                    value={stockOutEndDate}
                    editable={false}
                    style={styles.input}
                    placeholder=""
                    placeholderTextColor={theme.border}
                  />
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={theme.gray}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {showFilterStatus && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{statusName}</Text>
            <SelectList
              setSelected={setStatus}
              data={statusOptions}
              boxStyles={{
                flex: 1,
                borderWidth: 0,
                backgroundColor: theme.background,
              }}
              dropdownStyles={{ borderColor: theme.gray }}
              search={true}
              placeholder="Select Status"
              save="key"
              defaultOption={statusOptions.find((s: any) => s.key === status)}
            />
          </View>
        )}

        {isTypeDoc && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{"ประเภทเอกสาร"}</Text>
            <SelectList
              setSelected={setDocType}
              data={TypeDocOptions}
              boxStyles={{
                flex: 1,
                borderWidth: 0,
                backgroundColor: theme.background,
              }}
              dropdownStyles={{ borderColor: theme.gray }}
              search={true}
              placeholder="Select Status"
              save="key"
              defaultOption={TypeDocOptions.find((s: any) => s.key === menuId)}
            />
          </View>
        )}

        {showFilterReset && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetFilterForm}
          >
            <Ionicons name="refresh-outline" size={20} color={theme.black} />
            <Text style={{ marginLeft: 4 }}>reset</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={{ padding: 16, marginBottom: 16 }}>
        <CustomButton label={textSearch} onPress={onSearch} />
      </View>

      {showDatePicker && (
        <CustomDatePicker
          value={selectedDate}
          onConfirm={(date) => {
            setSelectedDate(date);
            setShowDatePicker(false);

            // -------------------------
            // เงื่อนไขวันที่
            // -------------------------
            if (selectTextDate === "start") {
              const formatted = formatThDate(date);
              // set start
              setDocumentStartDate(formatted);

              // ถ้ายังไม่มี end ให้ตาม start ไปเลย
              // หรือถ้า end เดิม < start ใหม่ ก็ให้ขยับ end มาเท่ากับ start
              if (!stockOutEndDate) {
                setDocumentEndDate(formatted);
              } else {
                const endDateObj = parseThDateString(stockOutEndDate);
                if (endDateObj && endDateObj < date) {
                  setDocumentEndDate(formatted);
                }
              }
            }

            if (selectTextDate === "end") {
              // ✅ ถ้ายังไม่มี start เลย ให้ set ทั้ง start และ end เป็นวันเดียวกัน
              if (!stockOutStartDate) {
                const formatted = formatThDate(date);
                setDocumentStartDate(formatted);
                setDocumentEndDate(formatted);
                return;
              }

              const startDateObj = parseThDateString(stockOutStartDate);

              // ถ้ามี start แล้ว และ end ที่เลือกต่ำกว่า start → ไม่ให้เลือก
              if (startDateObj && date < startDateObj) {
                Alert.alert(
                  "เลือกวันที่ไม่ถูกต้อง",
                  "วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่มต้น"
                );
                return;
              }

              const formatted = formatThDate(date);
              setDocumentEndDate(formatted);
            }
          }}
          onCancel={() => setShowDatePicker(false)}
        />
      )}

      <ScannerModal
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={(data: any) => {
          setDocumentNo(data);
          onSearch();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    ...theme.setFont,
    color: theme.mainApp,
    marginBottom: 4,
  },
  inputWrapper: {
    backgroundColor: theme.background,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 0,
  },
  input: {
    flex: 1,
    color: theme.text,
    ...theme.setFont,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 8,
  },
});
