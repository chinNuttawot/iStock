import {
  emitter,
  filterCreateDocumentTransfer,
  getDataTransfer,
} from "@/common/emitter";
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
import { formatThaiDate } from "@/screens/ScanOut/CreateDocument";
import {
  binCodesByLocationService,
  createDocumentSaveService,
  createDocumentService,
  getProfile,
  itemProductWSService,
  itemVariantWSService,
  locationService,
} from "@/service";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
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

type CreateDocRes = { docNo: string };
type OptionKV = { key: string; value: string };

export default function CreateDocumentTransferScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { menuId } = route.params as { menuId: number };
  const [docNo, setDocumentNo] = useState("");
  const [stockOutDate, setStockOutDate] = useState(formatThaiDate(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [locationCodeFrom, setLocationCodeFrom] = useState("");
  const [binCodeFrom, setBinCodeFrom] = useState("");
  const [locationCodeTo, setLocationCodeTo] = useState("");
  const [binCodeTo, setBinCodeTo] = useState("");
  const [remark, setRemark] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [editProducts, setEditProducts] = useState<any>({});
  const [viewMode, setViewMode] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [initData, setInitData] = useState<CreateDocRes | {}>({});
  const [binCodesFrom, setBinCodesFrom] = useState<OptionKV[]>([]);
  const [binCodesTo, setBinCodesTo] = useState<OptionKV[]>([]);
  const [locationsTo, setLocationsTo] = useState<OptionKV[]>([]);
  const [isload, setIsload] = useState(false);
  const [productCode, setProductCode] = useState("");
  const [modelOptions, setModelOptions] = useState<any[]>([]);
  const [description, setDescription] = useState("");
  const [stockQty, setStockQty] = useState(0);
  const isValid =
    !!docNo &&
    !!stockOutDate &&
    !!locationCodeFrom &&
    !!binCodeFrom &&
    !!locationCodeTo &&
    !!binCodeTo &&
    products.length > 0;

  const optionModalComponent: Modeloption = {
    change: { label: "ลบ", color: theme.red },
    changeCancel: { label: "แก้ไข", color: theme.mainApp },
  };

  const defaultBinFrom = useMemo(
    () => (binCodeFrom ? { key: binCodeFrom, value: binCodeFrom } : undefined),
    [binCodeFrom]
  );
  const defaultLocTo = useMemo(
    () =>
      locationCodeTo
        ? { key: locationCodeTo, value: locationCodeTo }
        : undefined,
    [locationCodeTo]
  );
  const defaultBinTo = useMemo(
    () => (binCodeTo ? { key: binCodeTo, value: binCodeTo } : undefined),
    [binCodeTo]
  );

  useEffect(() => {
    const isEmptyObject = Object.keys(editProducts).length === 0;
    if (!isEmptyObject) setShowAddModal(true);
  }, [editProducts]);

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
    emitter.on(filterCreateDocumentTransfer, onFilterChanged);
    return () => emitter.off(filterCreateDocumentTransfer, onFilterChanged);
  }, []);

  useLayoutEffect(() => {
    if (locationCodeTo) {
      getBinCode(locationCodeTo);
    } else {
      setBinCodeTo("");
      setBinCodesTo([]);
    }
  }, [locationCodeTo]);

  const getBinCode = async (locationCodeFrom: string) => {
    try {
      const { data } = await binCodesByLocationService({ locationCodeFrom });
      setBinCodeTo("");
      setBinCodesTo((data as OptionKV[]) || []);
    } catch {}
  };

  const getCreateDocument = useCallback(async () => {
    try {
      const menuIdNum = Number(menuId);
      if (!Number.isFinite(menuIdNum)) throw new Error("menuId is invalid");

      const createDocPromise = createDocumentService({ menuId: menuIdNum });
      const profilePromise = getProfile();

      const profile: any = await profilePromise;
      setLocationCodeFrom(profile?.branchCode || "");

      const binCodesPromise = profile?.branchCode
        ? binCodesByLocationService({ locationCodeFrom: profile.branchCode })
        : Promise.resolve({ data: [] as OptionKV[] });

      const locationPromise = locationService();

      const [{ data: doc }, binRes, locRes] = await Promise.all([
        createDocPromise,
        binCodesPromise,
        locationPromise,
      ]);

      setInitData(doc as CreateDocRes);
      setDocumentNo((doc as CreateDocRes)?.docNo ?? "");

      setBinCodesFrom((binRes?.data as OptionKV[]) ?? []);
      setLocationsTo((locRes?.data as OptionKV[]) ?? []);
    } catch (err: any) {
      console.error("getCreateDocument error:", err?.message || err);
    }
  }, [menuId]);

  useEffect(() => {
    getCreateDocument();
  }, [getCreateDocument]);

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
        locationCodeTo,
        binCodeTo,
        remark,
        products,
      };
      await createDocumentSaveService(param);
      navigation.goBack();
      emitter.emit(getDataTransfer, menuId);
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

  const onBackdropPress = (isOpen: boolean) => setIsOpen(isOpen);

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

    setViewMode((prev) =>
      prev.some((item) => item.id === dataView.id)
        ? prev.map((item) => (item.id === dataView.id ? dataView : item))
        : [...prev, dataView]
    );

    setProducts((prev) =>
      prev.some((item) => item.uuid === list.uuid)
        ? prev.map((item) => (item.uuid === list.uuid ? list : item))
        : [...prev, list]
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const onEditList = (id: string) => {
    const editlist = products.find((v) => v.uuid === id);
    if (editlist) setEditProducts(editlist);
  };

  const onDeleteList = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.uuid !== id));
    setViewMode((prev) => prev.filter((item) => item.id !== id));
  };

  const RenderFrom = () => (
    <View style={styles.mainInput}>
      <Text style={styles.labelMainInput}>คลังต้นทาง</Text>
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
            data={binCodesFrom}
            boxStyles={styles.selectBox}
            dropdownStyles={{ borderColor: theme.gray }}
            search={true}
            placeholder="Select"
            save="key"
            defaultOption={defaultBinFrom}
          />
        </View>
      </View>
    </View>
  );

  const RenderTo = () => (
    <View style={styles.mainInput}>
      <Text style={[styles.labelMainInput, { color: theme.error }]}>
        คลังปลายทาง
      </Text>
      <View style={styles.rowWrapper}>
        <View style={[styles.flex1, { marginRight: 16 }]}>
          <Text style={styles.label}>รหัสคลังหลัก</Text>
          <SelectList
            setSelected={setLocationCodeTo}
            data={locationsTo}
            boxStyles={styles.selectBox}
            dropdownStyles={{ borderColor: theme.gray }}
            search={true}
            placeholder="Select"
            save="key"
            defaultOption={defaultLocTo}
          />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.label}>รหัสคลังย่อย</Text>
          <SelectList
            setSelected={setBinCodeTo}
            data={binCodesTo}
            boxStyles={styles.selectBox}
            dropdownStyles={{ borderColor: theme.gray }}
            search={true}
            placeholder="Select"
            save="key"
            defaultOption={defaultBinTo}
          />
        </View>
      </View>
    </View>
  );

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
              style={styles.input}
              value={docNo}
              onChangeText={setDocumentNo}
              placeholder=""
              placeholderTextColor={theme.border}
            />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>วันที่โอนย้าย</Text>
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
                    onPress={() => onEditList(item.id)}
                  />
                  <CustomButtons
                    {...optionModalComponent.change}
                    onPress={() => onDeleteList(item.id)}
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
  mainInput: {
    backgroundColor: theme.mainInput,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  content: { padding: 16 },
  rowWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  flex1: { flex: 1 },
  inputGroup: { marginBottom: 16 },
  label: { ...theme.setFont, color: theme.mainApp, marginBottom: 4 },
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
  selectBox: { borderWidth: 0, backgroundColor: theme.background },
  addProductText: {
    ...theme.setFont,
    color: theme.mainApp,
    textAlign: "right",
  },
});
