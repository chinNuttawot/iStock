import {
  emitter,
  filterStockCheckDetail,
  getDataStockCheck,
} from "@/common/emitter";
import CustomButton from "@/components/CustomButton";
import DetailCard from "@/components/DetailCard";
import Header from "@/components/Header";
import EmptyState from "@/components/State/EmptyState";
import { ProductItem } from "@/dataModel/ScanIn/Detail";
import ModalComponent from "@/providers/Modal";
import { Modeloption } from "@/providers/Modal/Model";
import { theme } from "@/providers/Theme";
import { RouteParams } from "@/screens/Approve/Detail";
import { cardDetailIStockListService, deleteDocumentProducts } from "@/service";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
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

  useEffect(() => {
    const onFilterChanged = (data: any) => setFilter(data);
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
          .map((v: any) => ({ uuid: v.uuid, docNo: v.docNo }));
        await deleteDocumentProducts({ items: delItem });
        emitter.emit(getDataStockCheck, menuId);
        navigation.goBack();
      } else {
        navigation.goBack();
      }
    } catch (err) {
      Alert.alert("เกิดขอผิดพลาด", "ลองใหม่อีกครั้ง");
    }
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
      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
        title={docNo}
        onGoBack={onGoBack}
        // IconComponent={[
        //   <TouchableOpacity key="filter" onPress={openFilter}>
        //     <MaterialCommunityIcons
        //       name={filter?.isFilter ? "filter-check" : "filter"}
        //       size={30}
        //       color="white"
        //     />
        //   </TouchableOpacity>,
        // ]}
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
                goTo={() => onDeleteItem(item)}
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
