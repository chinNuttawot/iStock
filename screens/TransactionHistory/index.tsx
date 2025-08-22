import { emitter, filterTransactionHistory } from "@/common/emitter";
import Header from "@/components/Header";
import ScanCard, { StatusType } from "@/components/ScanCard/ScanCard";
import { theme } from "@/providers/Theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { styles } from "./Styles";

const cardData = [
  {
    id: "1",
    docNo: "TRO2506-079",
    status: "Open",
    details: [
      { label: "วันที่ส่งสินค้า", value: "23/06/2025" },
      { label: "เลขที่เอกสาร", value: "TRO2506-079" },
      { label: "ส่งจากคลัง", value: "00HO - Head Office" },
      { label: "E-Shop No.", value: "PRE2309023" },
      { label: "หมายเหตุ", value: "Operation Group สำหรับ Jubu Jibi" },
    ],
  },
  {
    id: "2",
    docNo: "TRO2506-080",
    status: "Approved",
    details: [
      { label: "วันที่ส่งสินค้า", value: "24/06/2025" },
      { label: "เลขที่เอกสาร", value: "TRO2506-080" },
      { label: "ส่งจากคลัง", value: "00HO - Head Office" },
      { label: "E-Shop No.", value: "PRE2309024" },
      { label: "หมายเหตุ", value: "Operation Group สำหรับ AAA" },
    ],
  },
  {
    id: "3",
    docNo: "TRO2506-010",
    status: "Pending Approval",
    details: [
      { label: "วันที่ส่งสินค้า", value: "24/06/2025" },
      { label: "เลขที่เอกสาร", value: "TRO2506-010" },
      { label: "ส่งจากคลัง", value: "00HO - Head Office" },
      { label: "E-Shop No.", value: "PRE2309025" },
      { label: "หมายเหตุ", value: "Operation Group สำหรับ BBB" },
    ],
  },
  {
    id: "4",
    docNo: "TRO2506-011",
    status: "Rejected",
    details: [
      { label: "วันที่ส่งสินค้า", value: "25/06/2025" },
      { label: "เลขที่เอกสาร", value: "TRO2506-011" },
      { label: "ส่งจากคลัง", value: "00HO - Head Office" },
      { label: "E-Shop No.", value: "PRE2309026" },
      {
        label: "หมายเหตุ",
        value:
          "Operation Gropdhgjkdhbgjkdfhg;jskdfhg;adfhgkjdfhg;kjsdfhgkj;dfahgljkdfsbkgjsbdfglkjhsdfgkjhdflgkjbsdflkgbdsflkjbgoup สำหรับ CCC",
      },
    ],
  },
];

export default function TransactionHistoryScreen() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<any>({});
  const navigation = useNavigation<any>();

  useEffect(() => {
    const onFilterChanged = (data: any) => {
      console.log(`${filterTransactionHistory} =====> `, data);
      setFilter(data);
    };
    emitter.on(filterTransactionHistory, onFilterChanged);
    return () => {
      emitter.off(filterTransactionHistory, onFilterChanged);
    };
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const openFilter = () => {
    setSelectedIds([]);
    navigation.navigate("Filter", { filter, statusName: "ประเภทเอกสาร" });
  };

  const goToDetail = (item: any) => {
    const { card } = item;
    navigation.navigate("TransactionHistoryDetail", { docNo: card.docNo });
  };
  return (
    <>
      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
        title={"ประวัติการทำรายการ"}
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
      <View style={{ flex: 1, backgroundColor: theme.white }}>
        <ScrollView contentContainerStyle={styles.content}>
          {cardData.map((card) => (
            <ScanCard
              status={card.status as StatusType}
              key={card.id}
              id={card.id}
              docNo={card.docNo}
              details={card.details}
              hideSelectedIds
              selectedIds={selectedIds}
              isSelected={selectedIds.includes(card.id)}
              isExpanded={expandedIds.includes(card.id)}
              onSelect={toggleSelect}
              onExpand={toggleExpand}
              goTo={() => goToDetail({ card })}
            />
          ))}
        </ScrollView>
      </View>
    </>
  );
}
