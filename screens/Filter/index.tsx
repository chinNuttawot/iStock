import CustomButton from "@/components/CustomButton";
import Header from "@/components/Header";
import ScannerModal from "@/components/Scanner";
import ModalComponent from "@/providers/Modal";
import { theme } from "@/providers/Theme";
import { resetFilter, setFilter } from "@/store/slices/filterSlice";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
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
import { useDispatch, useSelector } from "react-redux";

const statusOptions = [
  { key: "All", value: "All" },
  { key: "Open", value: "Open" },
  { key: "Pending Approval", value: "Pending Approval" },
  { key: "Approved", value: "Approved" },
  { key: "Rejected", value: "Rejected" },
];

export default function FilterScreen() {
  const [documentNo, setDocumentNo] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [status, setStatus] = useState("All");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigation = useNavigation<any>();
  const filter = useSelector((state: any) => state.filter);
  const dispatch = useDispatch();

  useEffect(() => {
    setStatus(filter.status);
    setDocumentDate(filter.documentDate);
    setDocumentNo(filter.documentNo);
  }, []);

  const resetFilterForm = () => {
    dispatch(resetFilter());
    setDocumentNo("");
    setDocumentDate("");
    setStatus("All");
    navigation.goBack();
  };

  const onSearch = () => {
    dispatch(setFilter({ status, documentDate, documentNo, isFilter: true }));
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
        <View style={styles.inputGroup}>
          <Text style={styles.label}>เลขที่เอกสาร</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={documentNo}
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>วันที่เอกสาร</Text>
          <TouchableOpacity
            style={styles.inputWrapper}
            onPress={() => setShowDatePicker(true)}
          >
            <TextInput
              value={documentDate}
              editable={false}
              style={styles.input}
              placeholder=""
              placeholderTextColor={theme.border}
            />
            <Ionicons name="calendar-outline" size={20} color={theme.gray} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>สถานะเอกสาร</Text>
          <SelectList
            setSelected={setStatus}
            data={statusOptions}
            boxStyles={{
              flex: 1,
              borderWidth: 0,
              backgroundColor: theme.background,
            }}
            dropdownStyles={{ borderColor: theme.gray }}
            search={false}
            placeholder="Select Status"
            save="key"
            defaultOption={statusOptions.find((s) => s.key === status)}
          />
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetFilterForm}>
          <Ionicons name="refresh-outline" size={20} color={theme.black} />
          <Text style={{ marginLeft: 4 }}>reset</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={{ padding: 16, marginBottom: 16 }}>
        <CustomButton label="ค้นหา" onPress={onSearch} />
      </View>
      {Platform.OS === "ios" && (
        <ModalComponent
          isOpen={showDatePicker}
          hideCustomButtons={true}
          onChange={onDateChange}
          backgroundColor={"Transparent"}
        >
          {showDatePicker && (
            <View style={{ backgroundColor: theme.gray, borderRadius: 8 }}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="inline"
                onChange={(e, date) => date && setSelectedDate(date)}
              />

              <View style={{ padding: 16, marginBottom: 16 }}>
                <CustomButton
                  label="ยืนยัน"
                  onPress={() => {
                    setDocumentDate(
                      selectedDate.toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    );
                    setShowDatePicker(false);
                  }}
                />
              </View>
            </View>
          )}
        </ModalComponent>
      )}
      {Platform.OS === "android" && showDatePicker && (
        <DateTimePicker
          textColor={theme.mainApp}
          style={{ backgroundColor: "#000" }}
          value={new Date()}
          mode="date"
          display="inline"
          onChange={onDateChange}
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
    paddingVertical: Platform.OS === "ios" ? 8 : 0,
  },
  input: {
    flex: 1,
    ...theme.setFont,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 8,
  },
});
