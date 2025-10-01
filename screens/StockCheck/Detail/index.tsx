import {
  emitter,
  filterStockCheckDetail,
  getDataStockCheck,
} from "@/common/emitter";
import CustomButton from "@/components/CustomButton";
import DetailCard from "@/components/DetailCard";
import Header from "@/components/Header";
import ProductAddModalComponent from "@/components/ProductAdd";
import EmptyState from "@/components/State/EmptyState";
import { ProductItem } from "@/dataModel/ScanIn/Detail";
import ModalComponent from "@/providers/Modal";
import { AddItemProduct } from "@/providers/Modal/AddItemProduct/indx";
import { Modeloption } from "@/providers/Modal/Model";
import { theme } from "@/providers/Theme";
import { RouteParams } from "@/screens/Approve/Detail";
import {
  addDocumentProducts,
  cardDetailIStockListService,
  deleteDocumentProducts,
  editDocumentProducts,
  itemProductWSService,
  itemVariantWSService,
} from "@/service";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./styles";

export const RenderGoBackItem = (
  <View style={styles.mainView}>
    <Text style={[styles.label, { textAlign: "center", padding: 8 }]}>
      คุณมีรายการที่ทำค้างอยู่ ต้องการออกจากหน้านี้หรือไม่
    </Text>
  </View>
);

export default function StockCheckDetailScreen() {
  const optionModalComponent: Modeloption = {
    change: { label: "ยืนยัน", color: theme.red },
    changeCancel: {
      label: "ยกเลิก",
      color: theme.cancel,
      colorText: theme.black,
    },
  };
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { docNo, menuId, status } = route.params as RouteParams;

  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [productData, setProductData] = useState<ProductItem[]>([]);
  const [filter, setFilter] = useState<any>({});

  // ✅ ใช้ confirm modal เดียว
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isShowGoBackScreen, setIsShowGoBackScreen] = useState(false);

  // refs สำหรับ flow
  const itemDetailRef = useRef<ProductItem | undefined>(undefined);
  const isShowGoBackScreenRef = useRef<boolean>(false);
  const textGray = (theme as any).textGray ?? (theme as any).gray ?? "#9ca3af";

  const [productCode, setProductCode] = useState("");
  const [stockQty, setStockQty] = useState(0);
  const [description, setDescription] = useState("");
  const [modelOptions, setModelOptions] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProducts, setEditProducts] = useState<any>({});
  const [products, setProducts] = useState<any[]>([]);
  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<ProductItem | null>(null);
  const [editForm, setEditForm] = useState<{
    quantity?: string;
    serialNo?: string;
    remark?: string;
  }>({});
  const [savingEdit, setSavingEdit] = useState(false);

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
    emitter.on(filterStockCheckDetail, onFilterChanged);
    return () => emitter.off(filterStockCheckDetail, onFilterChanged);
  }, []);

  useEffect(() => {
    getDataDetail();
  }, []);

  const getDataDetail = async () => {
    try {
      const { data } = await cardDetailIStockListService({
        docNo,
        menuId: menuId,
      });
      setProductData(data);
    } catch (err) {
      Alert.alert("เกิดขอผิดพลาด", "ลองใหม่อีกครั้ง");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const openFilter = () => {
    navigation.navigate("Filter", {
      filter,
      showFilterDate: false,
      showFilterStatus: false,
      ScanName: "รหัสสินค้า",
    });
  };

  // กด "ลบ"
  const onDeleteItem = (item: ProductItem) => {
    itemDetailRef.current = item;
    setIsShowGoBackScreen(false);
    isShowGoBackScreenRef.current = false;
    setConfirmOpen(true);
  };

  // กด back
  const onGoBack = () => {
    const hasDeleted = productData.some((v) => v.isDelete);
    if (hasDeleted) {
      setIsShowGoBackScreen(true);
      isShowGoBackScreenRef.current = true;
      setConfirmOpen(true);
    } else {
      navigation.goBack();
    }
  };

  // กด "ตกลง" ใน modal
  const handleConfirm = () => {
    if (isShowGoBackScreenRef.current) {
      // ยืนยันออก
      setConfirmOpen(false);
      setIsShowGoBackScreen(false);
      isShowGoBackScreenRef.current = false;
      navigation.goBack();
      return;
    }
    // ยืนยันลบ
    const target = itemDetailRef.current;
    if (target) {
      setProductData((prev) =>
        prev.map((it) => (it.id === target.id ? { ...it, isDelete: true } : it))
      );
    }
    setConfirmOpen(false);
  };

  // กด "ยกเลิก" หรือ แตะ backdrop
  const handleCancel = () => {
    setConfirmOpen(false);
    setIsShowGoBackScreen(false);
    isShowGoBackScreenRef.current = false;
  };

  const RenderDeleteItem = (
    <View style={styles.mainView}>
      <Text style={styles.label}>
        {`คุณต้องการลบ "${itemDetailRef.current?.docNo}-${itemDetailRef.current?.model}" หรือไม่`}
      </Text>
    </View>
  );

  const onSave = async () => {
    try {
      const hasDeleted = productData.some((v) => v.isDelete);
      if (hasDeleted) {
        const delItem = productData
          .filter((v) => v.isDelete)
          .map((v: any) => ({ uuid: v.uuid, productCode: v.productCode }));
        await deleteDocumentProducts({ items: delItem });
      }
      if (products.length > 0) {
        const payload = {
          docNo: products[0].docNo,
          products: products.map((item) => ({
            productCode: item.productCode,
            model: item.model,
            quantity: item.quantity,
            serialNo: item.serialNo,
            remark: item.remark,
            uuid: item.uuid,
            picURL: item.picURL,
          })),
        };
        await addDocumentProducts(payload);
      }
      emitter.emit(getDataStockCheck, menuId);
      navigation.goBack();
    } catch (err) {
      Alert.alert("เกิดขอผิดพลาด", "ลองใหม่อีกครั้ง");
    }
  };
  const onCloseEdit = () => {
    if (savingEdit) return; // กันปิดระหว่างบันทึก
    setEditOpen(false);
    setEditItem(null);
    setEditForm({});
  };

  const submitEdit = async () => {
    if (!editItem) return;

    const norm = (v?: string) => (typeof v === "string" ? v.trim() : "");
    const qRaw = norm(editForm.quantity);
    const snRaw = norm(editForm.serialNo);
    const rmRaw = norm(editForm.remark);
    const patch: any = {};
    if (qRaw !== "") patch.quantity = Number(qRaw);
    if (snRaw !== "") patch.serialNo = snRaw;
    if (rmRaw !== "") patch.remark = rmRaw;

    if (Object.keys(patch).length === 0) {
      onCloseEdit();
      return;
    }
    const uuid = editItem.uuid;
    const resData = productData.filter((v) => v.uuid === uuid);
    setSavingEdit(true);
    try {
      const payload = {
        items: [
          {
            uuid: resData[0].uuid,
            productCode: resData[0].productCode,
            patch,
          },
        ],
      };
      await editDocumentProducts(payload);
      onCloseEdit();
    } catch (e: any) {
    } finally {
      setSavingEdit(false);
    }
  };

  const RenderEditItem = (
    <View style={[{ height: "auto", marginBottom: 16, width: "100%" }]}>
      <Text style={[styles.label, { fontWeight: "700", fontSize: 16 }]}>
        แก้ไขรายการ
      </Text>

      {/* Quantity */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>จำนวน (quantity)</Text>
        <TextInput
          value={editForm.quantity}
          onChangeText={(t) =>
            setEditForm((s) => ({ ...s, quantity: t.replace(/[^\d]/g, "") }))
          }
          keyboardType="number-pad"
          placeholder="เช่น 10"
          style={styles.inputBox}
        />
      </View>

      {/* Serial No */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Serial No</Text>
        <TextInput
          value={editForm.serialNo}
          onChangeText={(t) => setEditForm((s) => ({ ...s, serialNo: t }))}
          placeholder="เช่น SN001"
          style={styles.inputBox}
        />
      </View>

      {/* Remark */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>หมายเหตุ (remark)</Text>
        <TextInput
          value={editForm.remark}
          onChangeText={(t) => setEditForm((s) => ({ ...s, remark: t }))}
          placeholder="เพิ่มหมายเหตุ"
          multiline
          style={[styles.inputBox, { minHeight: 96, textAlignVertical: "top" }]}
        />
      </View>
    </View>
  );

  // เปิด Modal แก้ไข
  const onOpenEdit = (item: ProductItem) => {
    setEditItem(item);
    setEditForm({
      quantity:
        (item as any).quantity != null ? String((item as any).quantity) : "",
      serialNo: (item as any).serialNo ?? "",
      remark: (item as any).remark ?? "",
    });
    setEditOpen(true);
  };

  const handleAddProduct = () => {
    navigation.navigate("Filter", {
      ScanName: "รหัสสินค้า",
      showFilterDate: false,
      showFilterStatus: false,
      showFilterReset: false,
      textSearch: "ถัดไป",
    });
  };

  const onSaveList = (list: AddItemProduct) => {
    const dataView = {
      id: list.uuid,
      docNo: list.productCode,
      model: list.model,
      qtyReceived: null,
      qtyShipped: null,
      isDelete: false,
      newItem: true,
      details: [
        { label: "ชื่อสินค้า", value: list.description || "ไม่มีชื่อสินค้า" },
        { label: "รหัสแบบ", value: list.model || "-" },
        { label: "คงเหลือ", value: stockQty.toString() || "-" },
        { label: "จำนวนสินค้า", value: list.quantity || "-" },
        { label: "Serial No", value: list.serialNo || "-" },
        { label: "หมายเหตุ", value: list.remark || "-" },
      ],
      picURL: list.picURL,
    };
    const updatedViewMode = productData.some((item) => item.id === dataView.id)
      ? productData.map((item) => (item.id === dataView.id ? dataView : item))
      : [...productData, dataView];
    setProductData(updatedViewMode as any);
    const updatedProducts = products.some((item) => item.uuid === list.uuid)
      ? products.map((item) =>
          item.uuid === list.uuid ? { ...list, docNo: docNo } : item
        )
      : [...products, { ...list, docNo: docNo }];
    setProducts(updatedProducts);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.white }}>
      <ModalComponent
        isOpen={confirmOpen}
        onChange={handleConfirm}
        option={optionModalComponent}
        onBackdropPress={handleCancel}
        onChangeCancel={handleCancel}
      >
        {isShowGoBackScreen ? RenderGoBackItem : RenderDeleteItem}
      </ModalComponent>

      {/* โมดัลแก้ไข */}
      <ModalComponent
        isOpen={editOpen}
        onChange={submitEdit} // ✅ ยิง API พร้อม patch ที่มีเฉพาะค่า
        option={{
          change: {
            label: savingEdit ? "กำลังบันทึก..." : "ตกลง",
            color: theme.mainApp,
          },
          changeCancel: {
            label: "ยกเลิก",
            color: theme.cancel,
            colorText: theme.black,
          },
          disabled: savingEdit as any,
        }}
        onBackdropPress={savingEdit ? undefined : onCloseEdit}
        onChangeCancel={savingEdit ? undefined : onCloseEdit}
      >
        {RenderEditItem}
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

      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
        title={docNo}
        onGoBack={onGoBack}
        IconComponent={
          status === "Open" && [
            <TouchableOpacity key="plus" onPress={handleAddProduct}>
              <MaterialCommunityIcons
                name="plus"
                size={30}
                color={theme.white}
              />
            </TouchableOpacity>,
          ]
        }
      />
      {productData.length === 0 && (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <EmptyState
            title="ไม่พบรายการ"
            subtitle=""
            icon="file-search-outline"
            color={textGray}
            actionLabel="รีโหลด"
            // onAction={fetchData}
            buttonBg={theme.mainApp}
            buttonTextColor={theme.white}
          />
        </View>
      )}
      {productData.length !== 0 && (
        <ScrollView contentContainerStyle={styles.content}>
          {productData
            .filter((v) => !v.isDelete)
            .map((item) => (
              <DetailCard
                key={item.id}
                data={item}
                isExpanded={expandedIds.includes(item.id)}
                onToggle={() => toggleExpand(item.id)}
                textGoTo="ลบ"
                colorButton={theme.red}
                isEdit={!item.newItem}
                goTo={(res) => {
                  if (res.mode === "edit") onOpenEdit(item as any);
                  else onDeleteItem(item as any);
                }}
                viewMode={status !== "Open"}
              />
            ))}
        </ScrollView>
      )}

      {status === "Open" && (
        <View style={{ padding: 16, marginBottom: 16 }}>
          <CustomButton label="บันทึก" onPress={onSave} />
        </View>
      )}
    </View>
  );
}
