import { emitter, filterScanOutDetail } from "@/common/emitter";
import CustomButton from "@/components/CustomButton";
import DetailCard from "@/components/DetailCard";
import Header from "@/components/Header";
import { ProductItem } from "@/dataModel/ScanIn/Detail";
import ModalComponent from "@/providers/Modal";
import { Modeloption } from "@/providers/Modal/Model";
import { theme } from "@/providers/Theme";
import { cardDetailIStockListService } from "@/service";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
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
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { docNo } = route.params as { docNo: string };

  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [productData, setProductData] = useState<ProductItem[]>([]);
  const [filter, setFilter] = useState<any>({});

  // ✅ ใช้ Confirm modal เดียว
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isShowGoBackScreen, setIsShowGoBackScreen] = useState(false);

  // refs
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
      const { data } = await cardDetailIStockListService({ docNo, menuId: 1 });
      setProductData(data);
    } catch (err) {}
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

  // กดปุ่ม "ลบ" ในการ์ด
  const onDeleteItem = (item: ProductItem) => {
    itemDetailRef.current = item;
    setIsShowGoBackScreen(false);
    isShowGoBackScreenRef.current = false;
    setConfirmOpen(true);
  };

  // ปุ่ม Back บน Header
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

  // กด "ตกลง" ในโมดัล
  const handleConfirm = () => {
    if (isShowGoBackScreenRef.current) {
      // ยืนยันออกจากหน้า
      setConfirmOpen(false);
      setIsShowGoBackScreen(false);
      isShowGoBackScreenRef.current = false;
      navigation.goBack();
      return;
    }
    // ยืนยันลบรายการ
    const target = itemDetailRef.current;
    if (target) {
      setProductData((prev) =>
        prev.map((it) => (it.id === target.id ? { ...it, isDelete: true } : it))
      );
    }
    setConfirmOpen(false);
  };

  // กด "ยกเลิก" หรือแตะ backdrop
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
      {/* ✅ โมดัลยืนยันแบบเดียว ครอบทั้ง “ลบ” และ “ออกจากหน้า” */}
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
