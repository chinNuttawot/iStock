import { emitter, filterTransfer } from "@/common/emitter";
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
    docId: "GRI2506-0742",
    status: "Open",
    details: [
      { label: "วันที่ส่งสินค้า", value: "23/06/2025" },
      { label: "คลังต้นทาง", value: "10CCB - สาขาเซ็นทรัลชลบุรี" },
      { label: "คลังปลายทาง", value: "00HQ - คลังสำนักงานใหญ่" },
      { label: "จัดทำโดย", value: "CCB" },
      { label: "หมายเหตุ", value: "ตัดเบิกโอเปอร์ประชุม ผจก. เดือน มิ.ย.68" },
    ],
  },
  {
    id: "2",
    docId: "TRO2506-080",
    status: "Approved",
    details: [],
  },
  {
    id: "3",
    docId: "GRI2506-0742",
    status: "Pending Approval",
    details: [],
  },
  {
    id: "4",
    docId: "GRI2506-0742",
    status: "Rejected",
    details: [],
  },
];

export default function TransferScreen() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<any>({});
  const navigation = useNavigation<any>();

  useEffect(() => {
    const onFilterChanged = (data: any) => {
      console.log(`${filterTransfer} =====> `, data);
      setFilter(data);
    };
    emitter.on(filterTransfer, onFilterChanged);
    return () => {
      emitter.off(filterTransfer, onFilterChanged);
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
    navigation.navigate("TransferDetail", { docId: card.docId });
  };

  const goToCreateDocument = () => {
    navigation.navigate("CreateDocumentTransfer");
  };
  return (
    <>
      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
        title={"สแกน-โอนย้าย"}
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
