import { emitter, filterApproveDetail } from "@/common/emitter";
import CustomButtons from "@/components/CustomButtons";
import DetailCard from "@/components/DetailCard";
import Header from "@/components/Header";
import { ProductItem } from "@/dataModel/ScanIn/Detail";
import ModalComponent from "@/providers/Modal";
import { theme } from "@/providers/Theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { RenderViewApprove, RenderViewReject } from "..";
import { styles } from "./styles";

export const RenderGoBackItem = (
  <View style={styles.mainView}>
    <Text
      style={[styles.label, { textAlign: "center", padding: 8 }]}
    >{`คุณมีรายการที่ทำค้างอยู่ ต้องการออกจากหน้านี้หรือไม่`}</Text>
  </View>
);

export const _productData = [
  {
    id: "1",
    docNo: "5OTH01475",
    model: "VR001",
    receivedQty: null,
    totalQty: null,
    isDelete: false,
    details: [
      { label: "รุ่น", value: "VR000" },
      {
        label: "หมายเหตุ",
        value: "ของเล่น ลาโพงน้องหมา M10",
      },
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
      {
        label: "หมายเหตุ",
        value: "ของเล่น น้องแมว M20",
      },
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
      {
        label: "หมายเหตุ",
        value: "ของเล่น น้องกระต่าย M30",
      },
      { label: "คงเหลือ", value: "10" },
    ],
    image: "https://picsum.photos/seed/shirt/100/100",
  },
];

export default function ApproveDetailScreen() {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [productData, setProductData] = useState<ProductItem[]>(_productData);
  const [filter, setFilter] = useState<any>({});
  const [isOpenViewReject, setIsOpenViewReject] = useState<boolean>(false);
  const [isOpenViewApprove, setIsOpenViewApprove] = useState<boolean>(false);
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { docNo } = route.params as { docNo: string };

  useEffect(() => {
    const onFilterChanged = (data: any) => {
      console.log(`${filterApproveDetail} =====> `, data);
      setFilter(data);
    };
    emitter.on(filterApproveDetail, onFilterChanged);
    return () => {
      emitter.off(filterApproveDetail, onFilterChanged);
    };
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

  const onGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.white }}>
      <ModalComponent
        isOpen={isOpenViewReject}
        onChange={() => {}}
        onBackdropPress={setIsOpenViewReject}
        option={{ change: { label: "ตกลง", color: theme.mainApp } }}
      >
        {RenderViewReject}
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenViewApprove}
        onChange={() => {}}
        onBackdropPress={setIsOpenViewApprove}
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
          <TouchableOpacity
            onPress={() => {
              openFilter();
            }}
          >
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
              viewMode
              key={item.id}
              data={item}
              isExpanded={expandedIds.includes(item.id)}
              onToggle={() => toggleExpand(item.id)}
              textGoTo="ลบ"
              colorButton={theme.red}
              goTo={() => {}}
            />
          ))}
      </ScrollView>
      <View style={{ padding: 16, marginBottom: 16, flexDirection: "row" }}>
        <CustomButtons
          color={theme.red}
          label="ปฏิเสธ"
          onPress={() => {
            setIsOpenViewReject(true);
          }}
        />
        <CustomButtons
          color={theme.green}
          label="อนุมัติรายการ"
          onPress={() => {
            setIsOpenViewApprove(true);
          }}
        />
      </View>
    </View>
  );
}
