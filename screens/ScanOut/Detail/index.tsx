import { emitter, filterScanOutDetail, getDataScanOut } from "@/common/emitter";
import CustomButton from "@/components/CustomButton";
import DetailCard from "@/components/DetailCard";
import Header from "@/components/Header";
import EmptyState from "@/components/State/EmptyState";
import { ProductItem } from "@/dataModel/ScanIn/Detail";
import ModalComponent from "@/providers/Modal";
import { Modeloption } from "@/providers/Modal/Model";
import { theme } from "@/providers/Theme";
import { RouteParams } from "@/screens/Approve/Detail";
import {
  cardDetailIStockListService,
  deleteDocumentProducts,
  editDocumentProducts, // ✅ ใช้ service แก้ไข
} from "@/service";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "./styles";

export const RenderGoBackItem = (
  <View style={styles.mainView}>
    <Text style={[styles.label, { textAlign: "center", padding: 8 }]}>
      คุณมีรายการที่ทำค้างอยู่ ต้องการออกจากหน้านี้หรือไม่
    </Text>
  </View>
);

export default function ScanOutDetailScreen() {
  const optionModalComponent: Modeloption = {
    change: { label: "ยืนยัน", color: theme.red },
    changeCancel: {
      label: "ยกเลิก",
      color: theme.cancel,
      colorText: theme.black,
    },
  };

  const textGray = (theme as any).textGray ?? (theme as any).gray ?? "#9ca3af";
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { docNo, menuId, status } = route.params as RouteParams;

  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [productData, setProductData] = useState<ProductItem[]>([]);
  const [filter, setFilter] = useState<any>({});

  // Confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isShowGoBackScreen, setIsShowGoBackScreen] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<ProductItem | null>(null);
  const [editForm, setEditForm] = useState<{
    quantity?: string;
    serialNo?: string;
    remark?: string;
  }>({});
  const [savingEdit, setSavingEdit] = useState(false);

  const itemDetailRef = useRef<ProductItem | undefined>(undefined);
  const isShowGoBackScreenRef = useRef<boolean>(false);

  useEffect(() => {
    const onFilterChanged = (data: any) => setFilter(data);
    emitter.on(filterScanOutDetail, onFilterChanged);
    return () => emitter.off(filterScanOutDetail, onFilterChanged);
  }, []);

  useEffect(() => {
    getDataDetail();
  }, []);

  const getDataDetail = async () => {
    try {
      const { data } = await cardDetailIStockListService({ docNo, menuId });
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

  // ลบรายการ
  const onDeleteItem = (item: ProductItem) => {
    itemDetailRef.current = item;
    setIsShowGoBackScreen(false);
    isShowGoBackScreenRef.current = false;
    setConfirmOpen(true);
  };

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

  const onCloseEdit = () => {
    if (savingEdit) return; // กันปิดระหว่างบันทึก
    setEditOpen(false);
    setEditItem(null);
    setEditForm({});
  };

  // กด Back บน Header
  const onGoBack = () => {
    const hasDeleted = productData.some((v) => (v as any).isDelete);
    if (hasDeleted) {
      setIsShowGoBackScreen(true);
      isShowGoBackScreenRef.current = true;
      setConfirmOpen(true);
    } else {
      navigation.goBack();
    }
  };

  // ตกลง (ลบ/ออกจากหน้า)
  const handleConfirm = () => {
    if (isShowGoBackScreenRef.current) {
      setConfirmOpen(false);
      setIsShowGoBackScreen(false);
      isShowGoBackScreenRef.current = false;
      navigation.goBack();
      return;
    }
    const target = itemDetailRef.current;
    if (target) {
      setProductData((prev) =>
        prev.map((it) => (it.id === target.id ? { ...it, isDelete: true } : it))
      );
    }
    setConfirmOpen(false);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setIsShowGoBackScreen(false);
    isShowGoBackScreenRef.current = false;
  };

  const RenderDeleteItem = (
    <View style={styles.mainView}>
      <Text style={styles.label}>
        {`คุณต้องการลบ "${itemDetailRef.current?.docNo}-${
          (itemDetailRef.current as any)?.model
        }" หรือไม่`}
      </Text>
    </View>
  );

  // บันทึกการลบทั้งหมด
  const onSave = async () => {
    try {
      const hasDeleted = productData.some((v) => (v as any).isDelete);
      if (hasDeleted) {
        const delItem = productData
          .filter((v) => (v as any).isDelete)
          .map((v: any) => ({ uuid: v.uuid, productCode: v.productCode })); // ✅ ใช้ productCode จริง
        await deleteDocumentProducts({ items: delItem });
        emitter.emit(getDataScanOut, menuId);
        navigation.goBack();
      } else {
        navigation.goBack();
      }
    } catch (err) {
      Alert.alert("เกิดขอผิดพลาด", "ลองใหม่อีกครั้ง");
    }
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

  return (
    <View style={{ flex: 1, backgroundColor: theme.white }}>
      {/* โมดัลยืนยัน (ลบ/ออกจากหน้า) */}
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

      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
        title={docNo}
        onGoBack={onGoBack}
      />

      {productData.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <EmptyState
            title="ไม่พบรายการ"
            subtitle=""
            icon="file-search-outline"
            color={textGray}
            actionLabel="รีโหลด"
            buttonBg={theme.mainApp}
            buttonTextColor={theme.white}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {productData
            .filter((v) => !(v as any).isDelete)
            .map((item) => (
              <DetailCard
                key={item.id}
                data={item}
                isExpanded={expandedIds.includes(item.id)}
                onToggle={() => toggleExpand(item.id)}
                textGoTo="ลบ"
                colorButton={theme.red}
                isEdit
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
