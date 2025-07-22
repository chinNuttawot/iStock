import { emitter, filterScanIn } from "@/common/emitter";
import CustomButton from "@/components/CustomButton";
import Header from "@/components/Header";
import ScanCard, { StatusType } from "@/components/ScanCard/ScanCard";
import { theme } from "@/providers/Theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./Styles";

const cardData = [
  {
    id: "1",
    docId: "TRO2506-079",
    status: "Open",
    details: [
      { label: "วันที่ส่งสินค้า", value: "23/06/2025" },
      { label: "ส่งจากคลัง", value: "00HO - Head Office" },
      { label: "E-Shop No.", value: "PRE2309023" },
      { label: "หมายเหตุ", value: "Operation Group สำหรับ Jubu Jibi" },
    ],
  },
  {
    id: "2",
    docId: "TRO2506-080",
    status: "Approved",
    details: [
      { label: "วันที่ส่งสินค้า", value: "24/06/2025" },
      { label: "ส่งจากคลัง", value: "00HO - Head Office" },
      { label: "E-Shop No.", value: "PRE2309024" },
      { label: "หมายเหตุ", value: "Operation Group สำหรับ AAA" },
    ],
  },
  {
    id: "3",
    docId: "TRO2506-011",
    status: "Rejected",
    details: [
      { label: "วันที่ส่งสินค้า", value: "25/06/2025" },
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

export default function ScanOutScreen() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<any>({});
  const navigation = useNavigation<any>();

  useEffect(() => {
    const onFilterChanged = (data: any) => {
      console.log(`${filterScanIn} =====> `, data);
      setFilter(data);
    };
    emitter.on(filterScanIn, onFilterChanged);
    return () => {
      emitter.off(filterScanIn, onFilterChanged);
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

  const handleSelectAll = () => {
    if (selectedIds.length === cardData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cardData.map((item) => item.id));
    }
  };

  const openFilter = () => {
    setSelectedIds([]);
    navigation.navigate("Filter", { filter });
  };

  const goToDetail = (item: any) => {
    const { card } = item;
    navigation.navigate("ScanOutDetail", { docId: card.docId });
  };

  const goToCreateDocument = () => {
    navigation.navigate("CreateDocumentScanOut");
  };
  return (
    <>
      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
        title={"สแกน-ออก"}
        IconComponent={[
          <TouchableOpacity onPress={goToCreateDocument}>
            <MaterialCommunityIcons name={"plus"} size={30} color="white" />
          </TouchableOpacity>,
          <TouchableOpacity onPress={openFilter}>
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
          <TouchableOpacity onPress={handleSelectAll}>
            <Text style={styles.selectAllText}>
              {selectedIds.length === cardData.length
                ? "ยกเลิก"
                : "เลือกทั้งหมด"}
            </Text>
          </TouchableOpacity>
          {cardData.map((card) => (
            <ScanCard
              status={card.status as StatusType}
              key={card.id}
              id={card.id}
              docId={card.docId}
              details={card.details}
              selectedIds={selectedIds}
              isSelected={selectedIds.includes(card.id)}
              isExpanded={expandedIds.includes(card.id)}
              onSelect={toggleSelect}
              onExpand={toggleExpand}
              goTo={() => goToDetail({ card })}
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
