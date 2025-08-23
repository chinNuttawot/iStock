import { emitter, filterStockCheckDetail } from "@/common/emitter";
import CustomButton from "@/components/CustomButton";
import DetailCard from "@/components/DetailCard";
import Header from "@/components/Header";
import { ProductItem } from "@/dataModel/ScanIn/Detail";
import ModalComponent from "@/providers/Modal";
import { Modeloption } from "@/providers/Modal/Model";
import { theme } from "@/providers/Theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

export const RenderGoBackItem = (
  <View style={styles.mainView}>
    <Text style={[styles.label, { textAlign: "center", padding: 8 }]}>
      คุณมีรายการที่ทำค้างอยู่ ต้องการออกจากหน้านี้หรือไม่
    </Text>
  </View>
);

export const _productData: ProductItem[] = [
  {
    id: "1",
    docNo: "5OTH01475",
    model: "VR001",
    qtyReceived: null,
    qtyShipped: null,
    isDelete: false,
    details: [
      { label: "รุ่น", value: "VR000" },
      { label: "หมายเหตุ", value: "ของเล่น ลาโพงน้องหมา M10" },
      { label: "คงเหลือ", value: "10" },
    ],
    image: "https://picsum.photos/seed/shirt/100/100",
  },
  {
    id: "2",
    docNo: "5OTH01475",
    model: "VR001",
    qtyReceived: null,
    qtyShipped: null,
    isDelete: false,
    details: [
      { label: "รุ่น", value: "VR001" },
      { label: "หมายเหตุ", value: "ของเล่น น้องแมว M20" },
      { label: "คงเหลือ", value: "10" },
    ],
    image: "https://picsum.photos/seed/shirt/100/100",
  },
  {
    id: "3",
    docNo: "5OTH01475",
    model: "VR002",
    qtyReceived: null,
    qtyShipped: null,
    isDelete: false,
    details: [
      { label: "รุ่น", value: "VR002" },
      { label: "หมายเหตุ", value: "ของเล่น น้องกระต่าย M30" },
      { label: "คงเหลือ", value: "10" },
    ],
    image: "https://picsum.photos/seed/shirt/100/100",
  },
];

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
  const { docNo } = route.params as { docNo: string };

  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [productData, setProductData] = useState<ProductItem[]>(_productData);
  const [filter, setFilter] = useState<any>({});

  // ✅ ใช้ confirm modal เดียว
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isShowGoBackScreen, setIsShowGoBackScreen] = useState(false);

  // refs สำหรับ flow
  const itemDetailRef = useRef<ProductItem | undefined>(undefined);
  const isShowGoBackScreenRef = useRef<boolean>(false);

  useEffect(() => {
    const onFilterChanged = (data: any) => setFilter(data);
    emitter.on(filterStockCheckDetail, onFilterChanged);
    return () => emitter.off(filterStockCheckDetail, onFilterChanged);
  }, []);

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
        IconComponent={[
          <TouchableOpacity key="filter" onPress={openFilter}>
            <MaterialCommunityIcons
              name={filter?.isFilter ? "filter-check" : "filter"}
              size={30}
              color="white"
            />
          </TouchableOpacity>,
        ]}
      />
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
            />
          ))}
      </ScrollView>
      <View style={{ padding: 16, marginBottom: 16 }}>
        <CustomButton label="บันทึก" />
      </View>
    </View>
  );
}
