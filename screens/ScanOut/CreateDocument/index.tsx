import CustomButton from "@/components/CustomButton";
import CustomDatePicker from "@/components/CustomDatePicker";
import Header from "@/components/Header";
import { theme } from "@/providers/Theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
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

export default function CreateDocumentScreen() {
  const navigation = useNavigation<any>();

  const [documentNo, setDocumentNo] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mainWarehouse, setMainWarehouse] = useState("");
  const [subWarehouse, setSubWarehouse] = useState("");
  const [remark, setRemark] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  const isValid =
    documentNo !== "" &&
    documentDate !== "" &&
    mainWarehouse !== "" &&
    subWarehouse !== "" &&
    remark !== "" &&
    products.length > 0;

  const handleAddProduct = () => {
    // setProducts([...products, { id: Date.now(), name: "" }]);
  };

  const handleSave = () => {
    console.log("📄 Saved:", {
      documentNo,
      documentDate,
      mainWarehouse,
      subWarehouse,
      remark,
      products,
    });
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.white }}>
      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
        title="สร้างเอกสาร"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.rowWrapper}>
          <View style={[styles.flex1, { marginRight: 16 }]}>
            <Text style={styles.label}>เลขที่เอกสาร</Text>
            <TextInput
              style={styles.input}
              value={documentNo}
              onChangeText={setDocumentNo}
              placeholder=""
              placeholderTextColor={theme.border}
            />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>วันที่ตัดสินค้า</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={documentDate}
                editable={false}
                placeholder=""
                placeholderTextColor={theme.border}
              />
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={theme.gray}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.rowWrapper}>
          <View style={[styles.flex1, { marginRight: 16 }]}>
            <Text style={styles.label}>รหัสคลังหลัก</Text>
            <TextInput
              style={styles.input}
              value={mainWarehouse}
              onChangeText={setMainWarehouse}
              placeholder=""
              placeholderTextColor={theme.border}
            />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>รหัสคลังย่อย</Text>
            <SelectList
              setSelected={setSubWarehouse}
              data={[{ key: "ABC-123", value: "ABC-123" }]}
              boxStyles={styles.selectBox}
              dropdownStyles={{ borderColor: theme.gray }}
              search={false}
              placeholder="Select"
              save="key"
              defaultOption={{ key: subWarehouse, value: subWarehouse }}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>หมายเหตุ</Text>
          <TextInput
            style={styles.input}
            value={remark}
            onChangeText={setRemark}
            placeholder=""
            placeholderTextColor={theme.border}
          />
        </View>

        <TouchableOpacity onPress={handleAddProduct}>
          <Text style={styles.addProductText}>เพิ่มสินค้า</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={{ padding: 16, marginBottom: 16 }}>
        <CustomButton label="บันทึก" onPress={handleSave} disabled={!isValid} />
      </View>

      {showDatePicker && (
        <CustomDatePicker
          value={selectedDate}
          onConfirm={(date) => {
            setSelectedDate(date);
            setDocumentDate(
              date.toLocaleDateString("th-TH", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            );
            setShowDatePicker(false);
          }}
          onCancel={() => setShowDatePicker(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  rowWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  flex1: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    ...theme.setFont,
    color: theme.mainApp,
    marginBottom: 4,
  },
  input: {
    backgroundColor: theme.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...theme.setFont,
  },
  inputWrapper: {
    backgroundColor: theme.background,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  selectBox: {
    borderWidth: 0,
    backgroundColor: theme.background,
  },
  addProductText: {
    ...theme.setFont,
    color: theme.mainApp,
    textAlign: "right",
  },
});
