import CustomButton from "@/components/CustomButton";
import Header from "@/components/Header";
import ScanCard, { StatusType } from "@/components/ScanCard/ScanCard";
import { theme } from "@/providers/Theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./Styles";
const cardData = [
  {
    id: "1",
    title: "TRO2506-079",
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
    title: "TRO2506-080",
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
    title: "TRO2506-010",
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
    title: "TRO2506-011",
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

export default function ScanInScreen() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const navigation = useNavigation<any>();
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

  const handleSelectAll = () => {
    if (selectedIds.length === cardData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cardData.map((item) => item.id));
    }
  };

  return (
    <>
      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
        title={"สแกน-รับ"}
        IconComponent={
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Filter");
            }}
          >
            <Ionicons name="filter" size={30} color="white" />
          </TouchableOpacity>
        }
      />
      <View style={{ flex: 1, backgroundColor: theme.white }}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={handleSelectAll}>
            <Text style={styles.selectAllText}>เลือกทั้งหมด</Text>
          </TouchableOpacity>
          {cardData.map((card) => (
            <ScanCard
              status={card.status as StatusType}
              key={card.id}
              id={card.id}
              title={card.title}
              details={card.details}
              selectedIds={selectedIds}
              isSelected={selectedIds.includes(card.id)}
              isExpanded={expandedIds.includes(card.id)}
              onSelect={toggleSelect}
              onExpand={toggleExpand}
            />
          ))}
        </ScrollView>
        <View style={{ padding: 16, marginBottom: 16 }}>
          <CustomButton label="ส่งเอกสาร" disabled={selectedIds.length === 0} />
        </View>
      </View>
    </>
  );
}
