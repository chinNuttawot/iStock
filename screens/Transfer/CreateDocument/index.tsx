import CustomButton from "@/components/CustomButton";
import CustomButtons from "@/components/CustomButtons";
import CustomDatePicker from "@/components/CustomDatePicker";
import DetailCard from "@/components/DetailCard";
import Header from "@/components/Header";
import ProductAddModalComponent from "@/components/ProductAdd";
import ModalComponent from "@/providers/Modal";
import { AddItemProduct } from "@/providers/Modal/AddItemProduct/indx";
import { Modeloption } from "@/providers/Modal/Model";
import { theme } from "@/providers/Theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import { Divider } from "react-native-elements";
import { RenderGoBackItem } from "../Detail";

export default function CreateDocumentTransferScreen() {
  const navigation = useNavigation<any>();
  const [documentNo, setDocumentNo] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mainWarehouseFrom, setMainWarehouseFrom] = useState("");
  const [subWarehouseFrom, setSubWarehouseFrom] = useState("");
  const [mainWarehouseTo, setMainWarehouseTo] = useState("");
  const [subWarehouseTo, setSubWarehouseTo] = useState("");
  const [remark, setRemark] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [editProducts, setEditProducts] = useState<any>({});
  const [viewMode, setViewMode] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const stockQty = 99;
  const isValid =
    documentNo !== "" &&
    documentDate !== "" &&
    mainWarehouseFrom !== "" &&
    subWarehouseFrom !== "" &&
    mainWarehouseTo !== "" &&
    subWarehouseTo !== "" &&
    products.length > 0;

  const optionModalComponent: Modeloption = {
    change: { label: "ลบ", color: theme.red },
    changeCancel: {
      label: "แก้ไข",
      color: theme.mainApp,
    },
  };

  useEffect(() => {
    const isEmptyObject = Object.keys(editProducts).length === 0;
    if (!isEmptyObject) {
      setShowAddModal(true);
    }
  }, [editProducts]);

  const handleAddProduct = () => {
    setShowAddModal(true);
  };

  const handleSave = () => {
    console.log("📄 Saved:", {
      documentNo,
      documentDate,
      mainWarehouseFrom,
      subWarehouseFrom,
      mainWarehouseTo,
      subWarehouseTo,
      remark,
      products,
    });
    navigation.goBack();
  };
  const mainGoBack = (_open: boolean) => {
    setIsOpen(false);
    navigation.goBack();
  };

  const onBackdropPress = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onSaveList = (list: AddItemProduct) => {
    const dataView = {
      id: list.uuid,
      docId: list.productCode,
      model: list.selectedModel,
      receivedQty: null,
      totalQty: null,
      isDelete: false,
      details: [
        { label: "รหัสแบบ", value: list.selectedModel || "-" },
        { label: "คงเหลือ", value: stockQty.toString() || "-" },
        { label: "จำนวนสินค้า", value: list.orderQty || "-" },
        { label: "Serial No", value: list.serialNo || "-" },
        { label: "หมายเหตุ", value: list.remark || "-" },
      ],
      image: "https://picsum.photos/seed/shirt/100/100",
    };
    const updatedViewMode = viewMode.some((item) => item.id === dataView.id)
      ? viewMode.map((item) => (item.id === dataView.id ? dataView : item))
      : [...viewMode, dataView];
    setViewMode(updatedViewMode);
    const updatedProducts = products.some((item) => item.uuid === list.uuid)
      ? products.map((item) => (item.uuid === list.uuid ? list : item))
      : [...products, list];
    setProducts(updatedProducts);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const onEditList = (id: string) => {
    const editlist = products.filter((v) => v.uuid === id)[0];
    setEditProducts(editlist);
  };

  const onDeleteList = (id: string) => {
    const updatedProducts = products.filter((item) => item.uuid !== id);
    setProducts(updatedProducts);
    const updatedViewMode = viewMode.filter((item) => item.id !== id);
    setViewMode(updatedViewMode);
  };

  const RenderFrom = () => {
    return (
      <View style={styles.mainInput}>
        <Text style={styles.labelMainInput}>คลังต้นทาง</Text>
        <View style={styles.rowWrapper}>
          <View style={[styles.flex1, { marginRight: 16 }]}>
            <Text style={styles.label}>รหัสคลังหลัก</Text>
            <TextInput
              style={styles.input}
              value={mainWarehouseFrom}
              onChangeText={setMainWarehouseFrom}
              placeholder=""
              placeholderTextColor={theme.border}
            />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>รหัสคลังย่อย</Text>
            <SelectList
              setSelected={setSubWarehouseFrom}
              data={[{ key: "ABC-123", value: "ABC-123" }]}
              boxStyles={styles.selectBox}
              dropdownStyles={{ borderColor: theme.gray }}
              search={false}
              placeholder="Select"
              save="key"
              defaultOption={{ key: subWarehouseFrom, value: subWarehouseFrom }}
            />
          </View>
        </View>
      </View>
    );
  };

  const RenderTo = () => {
    return (
      <View style={styles.mainInput}>
        <Text style={[styles.labelMainInput, { color: theme.error }]}>
          คลังปลายทาง
        </Text>
        <View style={styles.rowWrapper}>
          <View style={[styles.flex1, { marginRight: 16 }]}>
            <Text style={styles.label}>รหัสคลังหลัก</Text>
            <TextInput
              style={styles.input}
              value={mainWarehouseTo}
              onChangeText={setMainWarehouseTo}
              placeholder=""
              placeholderTextColor={theme.border}
            />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>รหัสคลังย่อย</Text>
            <SelectList
              setSelected={setSubWarehouseTo}
              data={[{ key: "ABC-123", value: "ABC-123" }]}
              boxStyles={styles.selectBox}
              dropdownStyles={{ borderColor: theme.gray }}
              search={false}
              placeholder="Select"
              save="key"
              defaultOption={{ key: subWarehouseTo, value: subWarehouseTo }}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.white }}>
      <ModalComponent
        isOpen={isOpen}
        onChange={mainGoBack}
        option={optionModalComponent}
        onBackdropPress={onBackdropPress}
        onChangeCancel={() => setIsOpen(false)}
      >
        {RenderGoBackItem}
      </ModalComponent>
      <ProductAddModalComponent
        isVisible={showAddModal}
        onClose={() => {
          setEditProducts({});
          setShowAddModal(false);
        }}
        onSave={onSaveList}
        productCode="50TH01475"
        modelOptions={[{ key: "VR000", value: "VR000" }]}
        stockQty={stockQty}
        value={editProducts}
      />
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
      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
        title="สร้างเอกสาร"
        onGoBack={() => setIsOpen(true)}
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
        {RenderFrom()}
        {RenderTo()}
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
        <Divider orientation="horizontal" style={{ marginVertical: 10 }} />
        <TouchableOpacity
          onPress={handleAddProduct}
          style={{ marginBottom: 16 }}
        >
          <Text style={styles.addProductText}>เพิ่มสินค้า</Text>
        </TouchableOpacity>
        {viewMode
          .filter((v) => !v.isDelete)
          .map((item, k) => (
            <DetailCard
              key={k}
              data={item}
              isExpanded={expandedIds.includes(item.id)}
              onToggle={() => toggleExpand(item.id)}
              textGoTo="ลบ"
              colorButton={theme.red}
              goTo={() => {}}
              customButton={
                <View style={{ flexDirection: "row" }}>
                  <CustomButtons
                    {...optionModalComponent.changeCancel}
                    onPress={() => {
                      onEditList(item.id);
                    }}
                  />
                  <CustomButtons
                    {...optionModalComponent.change}
                    onPress={() => {
                      onDeleteList(item.id);
                    }}
                  />
                </View>
              }
            />
          ))}
      </ScrollView>
      <View style={{ padding: 16, marginBottom: 16 }}>
        <CustomButton label="บันทึก" onPress={handleSave} disabled={!isValid} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainInput: {
    backgroundColor: theme.mainInput,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
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
  labelMainInput: {
    ...theme.setFont,
    color: theme.green2,
    marginBottom: 20,
    fontSize: 20,
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
