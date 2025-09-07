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
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";

import {
  emitter,
  filterCreateDocumentScanOut,
  filterDataDashboard,
  getDataScanOut,
} from "@/common/emitter";
import {
  binCodesByLocationService,
  createDocumentSaveService,
  createDocumentService,
  getProfile,
  itemProductWSService,
  itemVariantWSService,
} from "@/service";
import {
  Alert,
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

export function formatThaiDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = (date.getFullYear() + 543).toString(); // ✅ แปลงเป็น พ.ศ.
  return `${d}/${m}/${y}`;
}

export default function CreateDocumentScreen() {
  const navigation = useNavigation<any>();
  const [docNo, setDocumentNo] = useState("");
  const [stockOutDate, setStockOutDate] = useState(formatThaiDate(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [locationCodeFrom, setLocationCodeFrom] = useState("");
  const [binCodeFrom, setBinCodeFrom] = useState("");
  const [dataBinCodes, setDataBinCodes] = useState([]);
  const [remark, setRemark] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isload, setIsload] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [editProducts, setEditProducts] = useState<any>({});
  const [viewMode, setViewMode] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [modelOptions, setModelOptions] = useState<any[]>([]);
  const [initData, setInitData] = useState({});
  const [productCode, setProductCode] = useState("");
  const [description, setDescription] = useState("");
  const route = useRoute();
  const { menuId } = route.params as { menuId: number };
  const [stockQty, setStockQty] = useState(0);
  const isValid = products.length > 0;

  const optionModalComponent: Modeloption = {
    change: { label: "ลบ", color: theme.red },
    changeCancel: {
      label: "แก้ไข",
      color: theme.mainApp,
    },
  };

  useEffect(() => {
    getCreateDocument();
  }, []);

  useEffect(() => {
    const onFilterChanged = async ({ docNo: itemNo }: any) => {
      if (!itemNo) {
        Alert.alert("เกิดขอผิดพลาด", "ไม่มีรหัสสินค้า");
        return;
      }
      const { data } = await itemProductWSService({ itemNo });
      if (data.length === 0) {
        Alert.alert("เกิดขอผิดพลาด", "ไม่พบข้อมูล");
        return;
      }
      const { data: dataVariant } = await itemVariantWSService({ itemNo });
      if (dataVariant.length === 0) {
        Alert.alert("เกิดขอผิดพลาด", "ไม่พบข้อมูล");
        return;
      }
      const _data = data[0];
      setProductCode(itemNo);
      setStockQty(_data.qtyShipped);
      setDescription(_data.description);
      setModelOptions(dataVariant);
      setShowAddModal(true);
    };
    emitter.on(filterCreateDocumentScanOut, onFilterChanged);
    return () => emitter.off(filterCreateDocumentScanOut, onFilterChanged);
  }, []);

  const getCreateDocument = async () => {
    try {
      const profile = (await getProfile()) as any;
      const menuIdNum = Number(menuId);
      const { data } = await createDocumentService({
        menuId: menuIdNum,
      });
      setInitData(data);
      setDocumentNo(data.docNo);
      setLocationCodeFrom(profile.branchCode);
      const { data: dataBinCodesByLocationService } =
        await binCodesByLocationService({
          locationCodeFrom: profile.branchCode,
        });
      setDataBinCodes(dataBinCodesByLocationService);
    } catch (err) {}
  };

  useEffect(() => {
    const isEmptyObject = Object.keys(editProducts).length === 0;
    if (!isEmptyObject) {
      setShowAddModal(true);
    }
  }, [editProducts]);

  const handleAddProduct = () => {
    navigation.navigate("Filter", {
      ScanName: "รหัสสินค้า",
      showFilterDate: false,
      showFilterStatus: false,
      showFilterReset: false,
      textSearch: "ถัดไป",
    });
  };

  const handleSave = async () => {
    try {
      setIsload(true);
      const profile = (await getProfile()) as any;
      const param = {
        ...initData,
        docNo,
        stockOutDate,
        createdBy: profile.userName,
        locationCodeFrom,
        binCodeFrom,
        remark,
        products,
      };
      await createDocumentSaveService(param);
      navigation.goBack();
      emitter.emit(getDataScanOut, menuId);
      emitter.emit(filterDataDashboard);
    } catch (err) {
      Alert.alert("เกิดขอผิดพลาด", "ลองใหม่อีกครั้ง");
    } finally {
      setIsload(false);
    }
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
      docNo: list.productCode,
      model: list.model,
      qtyReceived: null,
      qtyShipped: null,
      isDelete: false,
      details: [
        { label: "รหัสแบบ", value: list.model || "-" },
        { label: "คงเหลือ", value: stockQty.toString() || "-" },
        { label: "จำนวนสินค้า", value: list.quantity || "-" },
        { label: "Serial No", value: list.serialNo || "-" },
        { label: "หมายเหตุ", value: list.remark || "-" },
      ],
      picURL: list.picURL,
    };
    const updatedViewMode = viewMode.some((item) => item.id === dataView.id)
      ? viewMode.map((item) => (item.id === dataView.id ? dataView : item))
      : [...viewMode, dataView];
    setViewMode(updatedViewMode);
    const updatedProducts = products.some((item) => item.uuid === list.uuid)
      ? products.map((item) =>
          item.uuid === list.uuid ? { ...list, docNo: docNo } : item
        )
      : [...products, { ...list, docNo: docNo }];

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
        description={description}
        productCode={productCode}
        modelOptions={modelOptions}
        stockQty={stockQty}
        value={editProducts}
      />
      {showDatePicker && (
        <CustomDatePicker
          value={selectedDate}
          onConfirm={(date) => {
            setSelectedDate(date);
            setStockOutDate(
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
              editable={false}
              style={styles.input}
              value={docNo}
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
                value={stockOutDate}
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
              editable={false}
              style={styles.input}
              value={locationCodeFrom}
              onChangeText={setLocationCodeFrom}
              placeholder=""
              placeholderTextColor={theme.border}
            />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>รหัสคลังย่อย</Text>
            <SelectList
              setSelected={setBinCodeFrom}
              data={dataBinCodes}
              boxStyles={styles.selectBox}
              dropdownStyles={{ borderColor: theme.gray }}
              search={true}
              placeholder="Select"
              save="key"
              defaultOption={{ key: binCodeFrom, value: binCodeFrom }}
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
        <CustomButton
          label="บันทึก"
          onPress={handleSave}
          disabled={!isValid}
          isload={isload}
        />
      </View>
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
    paddingVertical: 12,
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
