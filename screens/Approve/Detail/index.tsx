import { emitter, filterApproveDetail } from "@/common/emitter";
import CustomButtons from "@/components/CustomButtons";
import DetailCard from "@/components/DetailCard";
import Header from "@/components/Header";
import { ProductItem } from "@/dataModel/ScanIn/Detail";
import ModalComponent from "@/providers/Modal";
import { theme } from "@/providers/Theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
    receivedQty: null,
    totalQty: null,
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
    receivedQty: null,
    totalQty: null,
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
    receivedQty: null,
    totalQty: null,
    isDelete: false,
    details: [
      { label: "รุ่น", value: "VR002" },
      { label: "หมายเหตุ", value: "ของเล่น น้องกระต่าย M30" },
      { label: "คงเหลือ", value: "10" },
    ],
    image: "https://picsum.photos/seed/shirt/100/100",
  },
];

export default function ApproveDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { docNo } = (route.params ?? {}) as { docNo: string };

  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [productData] = useState<ProductItem[]>(_productData);
  const [filter, setFilter] = useState<any>({});
  const [isOpenViewReject, setIsOpenViewReject] = useState(false);
  const [isOpenViewApprove, setIsOpenViewApprove] = useState(false);

  // รับค่า filter จากหน้าอื่น
  useEffect(() => {
    const onFilterChanged = (data: any) => setFilter(data);
    emitter.on(filterApproveDetail, onFilterChanged);
    return () => emitter.off(filterApproveDetail, onFilterChanged);
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const openFilter = useCallback(() => {
    navigation.navigate("Filter", {
      filter,
      showFilterDate: false,
      showFilterStatus: false,
      ScanName: "รหัสสินค้า",
    });
  }, [filter, navigation]);

  const onGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const visibleItems = useMemo(
    () => productData.filter((v) => !v.isDelete),
    [productData]
  );
  const RenderViewReject = (
    <View style={styles.mainView}>
      <Text
        style={[
          styles.label,
          { ...theme.setFont_Bold },
          { textAlign: "center", padding: 8, fontSize: 20 },
        ]}
      >{`ปฏิเสธรายการ`}</Text>
      <Text
        style={[
          styles.label,
          { textAlign: "center", padding: 8, marginBottom: 26 },
        ]}
      >{`คุณต้องการที่จะปฏิเสธรายการที่เลือกหรือไม่`}</Text>
    </View>
  );

  const RenderViewApprove = (
    <View style={styles.mainView}>
      <Text
        style={[
          styles.label,
          { ...theme.setFont_Bold },
          { textAlign: "center", padding: 8, fontSize: 20 },
        ]}
      >{`อนุมัติรายการ`}</Text>
      <Text
        style={[
          styles.label,
          { textAlign: "center", padding: 8, marginBottom: 26 },
        ]}
      >{`คุณต้องการที่จะอนุมัติรายการที่เลือกหรือไม่`}</Text>
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: theme.white }}>
      {/* Reject modal */}
      <ModalComponent
        isOpen={isOpenViewReject}
        onChange={() => setIsOpenViewReject(false)}
        onBackdropPress={() => setIsOpenViewReject(false)}
        option={{ change: { label: "ตกลง", color: theme.mainApp } }}
      >
        {RenderViewReject}
      </ModalComponent>

      {/* Approve modal */}
      <ModalComponent
        isOpen={isOpenViewApprove}
        onChange={() => setIsOpenViewApprove(false)}
        onBackdropPress={() => setIsOpenViewApprove(false)}
        option={{ change: { label: "ตกลง", color: theme.mainApp } }}
      >
        {RenderViewApprove}
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
        {visibleItems.map((item) => (
          <DetailCard
            key={item.id}
            data={item}
            viewMode
            isExpanded={expandedIds.includes(item.id)}
            onToggle={() => toggleExpand(item.id)}
          />
        ))}
      </ScrollView>

      <View style={{ padding: 16, marginBottom: 16, flexDirection: "row" }}>
        <CustomButtons
          color={theme.red}
          label="ปฏิเสธ"
          onPress={() => setIsOpenViewReject(true)}
        />
        <CustomButtons
          color={theme.green}
          label="อนุมัติรายการ"
          onPress={() => setIsOpenViewApprove(true)}
        />
      </View>
    </View>
  );
}
