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
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SelectList } from "react-native-dropdown-select-list";

export default function FilterScreen() {
  const [docNo, setDocumentNo] = useState("");
  const [stockOutDate, setDocumentDate] = useState("");
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
      setDocumentDate(filter?.stockOutDate);
      setDocumentNo(filter?.docNo);
      setDocType(filter?.menuId);
    }
  }, []);

  const resetFilterForm = () => {
    Promise.all([
      setDocumentNo(""),
      setDocumentDate(""),
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
      stockOutDate,
      docNo,
      menuId,
      isFilter: true,
      isReset: false,
    };
    goEmitter(parmas);
    navigation.goBack();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toLocaleDateString("th-TH");
      setDocumentDate(formatted);
    }
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
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => setShowDatePicker(true)}
            >
              <TextInput
                value={stockOutDate}
                editable={false}
                style={styles.input}
                placeholder=""
                placeholderTextColor={theme.border}
              />
              <Ionicons name="calendar-outline" size={20} color={theme.gray} />
            </TouchableOpacity>
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
              defaultOption={statusOptions.find((s) => s.key === status)}
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
              defaultOption={TypeDocOptions.find((s) => s.key === menuId)}
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
            setDocumentDate(
              date.toLocaleDateString("th-TH", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            );
          }}
          onCancel={() => setShowDatePicker(false)}
        />
      )}
      <ScannerModal
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={(data: any) => setDocumentNo(data)}
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
