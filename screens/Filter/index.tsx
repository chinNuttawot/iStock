import CustomButton from "@/components/CustomButton";
import Header from "@/components/Header";
import { theme } from "@/providers/Theme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SelectList } from "react-native-dropdown-select-list";

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

  const resetFilter = () => {
    setDocumentNo("");
    setDocumentDate("");
    setStatus("All");
  };

  const onSearch = () => {
    // Call search action with filter values
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
            />
            <TouchableOpacity>
              <Ionicons name="scan-outline" size={20} color={theme.gray} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>วันที่เอกสาร</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={documentDate}
              editable={false}
              style={styles.input}
              placeholder=""
            />
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color={theme.gray} />
            </TouchableOpacity>
          </View>
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

        <TouchableOpacity style={styles.resetButton} onPress={resetFilter}>
          <Ionicons name="refresh-outline" size={20} color={theme.black} />
          <Text style={{ marginLeft: 4 }}>reset</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={{ padding: 16, marginBottom: 16 }}>
        <CustomButton label="ค้นหา" onPress={onSearch} />
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
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
    // paddingVertical: 8,
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
