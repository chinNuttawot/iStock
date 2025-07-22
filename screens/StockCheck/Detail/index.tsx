import {
  emitter,
  filterStockCheckDetail
} from "@/common/emitter";
import CustomButton from "@/components/CustomButton";
import DetailCard from "@/components/DetailCard";
import Header from "@/components/Header";
import { ProductItem } from "@/dataModel/ScanIn/Detail";
import ModalComponent from "@/providers/Modal";
import { theme } from "@/providers/Theme";
import { optionModalComponent } from "@/screens/Setting/SettingScreen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
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
    docId: "5OTH01475",
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
    docId: "5OTH01475",
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
    docId: "5OTH01475",
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

export default function StockCheckDetailScreen() {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [productData, setProductData] = useState<ProductItem[]>(_productData);
  const [filter, setFilter] = useState<any>({});
  const [isOpen, setIsOpen] = useState(false);
  const [isShowGoBackScreen, setIsShowGoBackScreen] = useState(false);
  const [itemDetail, setItemDetail] = useState<ProductItem>();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const itemDetailRef = useRef<ProductItem | undefined>(undefined);
  const isShowGoBackScreenRef = useRef<boolean>(false);
  const { docId } = route.params as { docId: string };

  useEffect(() => {
    const onFilterChanged = (data: any) => {
      console.log(`${filterStockCheckDetail} =====> `, data);
      setFilter(data);
    };
    emitter.on(filterStockCheckDetail, onFilterChanged);
    return () => {
      emitter.off(filterStockCheckDetail, onFilterChanged);
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

  const onDeleteItem = (item: ProductItem) => {
    setIsOpen(true);
    setItemDetail(item);
    itemDetailRef.current = item; // ✅ เก็บไว้ใน ref ด้วย
  };

  const onSavedataDetail = (isOpen: boolean) => {
    setProductData((prev) =>
      prev.map((item) =>
        item.id === itemDetailRef.current?.id
          ? { ...item, isDelete: true }
          : item
      )
    );
    setIsOpen(!isOpen);
  };

  const onBackdropPress = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onGoBack = () => {
    const filterIsDelete = productData.filter((v) => v.isDelete).length;
    if (filterIsDelete > 0) {
      setIsShowGoBackScreen(true);
      isShowGoBackScreenRef.current = true;
      setIsOpen(true);
    } else {
      navigation.goBack();
    }
  };

  const mainGoBack = (_open: boolean) => {
    if (isShowGoBackScreenRef.current) {
      setIsOpen(false);
      setIsShowGoBackScreen(false);
      isShowGoBackScreenRef.current = false;
      navigation.goBack();
    } else {
      onSavedataDetail(_open);
    }
  };

  const RenderDeleteItem = (
    <View style={styles.mainView}>
      <Text
        style={styles.label}
      >{`คุณต้องการลบ "${itemDetail?.docId}-${itemDetail?.model}" หรือไม่`}</Text>
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
        {isShowGoBackScreen ? RenderGoBackItem : RenderDeleteItem}
      </ModalComponent>
      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
        title={docId}
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
              key={item.id}
              data={item}
              isExpanded={expandedIds.includes(item.id)}
              onToggle={() => toggleExpand(item.id)}
              textGoTo="ลบ"
              colorButton={theme.red}
              goTo={() => {
                onDeleteItem(item);
              }}
            />
          ))}
      </ScrollView>
      <View style={{ padding: 16, marginBottom: 16 }}>
        <CustomButton label="บันทึก" />
      </View>
    </View>
  );
}
