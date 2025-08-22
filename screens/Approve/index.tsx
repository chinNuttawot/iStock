import { emitter, filterApprove } from "@/common/emitter";
import CustomButtons from "@/components/CustomButtons";
import Header from "@/components/Header";
import ScanCard, { StatusType } from "@/components/ScanCard/ScanCard";
import ModalComponent from "@/providers/Modal";
import { theme } from "@/providers/Theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { Fragment, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./Styles";

export const RenderViewReject = (
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

export const RenderViewApprove = (
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

const cardData = [
  {
    id: "1",
    docNo: "TRO2506-079",
    status: "Open",
    details: [
      { label: "วันที่ตรวจนับ", value: "23/06/2025" },
      { label: "จัดทำโดย", value: "CHY" },
      { label: "หมายเหตุ", value: "ตัดเบิกโอเปอร์ประชุม ผจก. เดือน มิ.ย.68" },
    ],
  },
  {
    id: "2",
    docNo: "TRO2506-080",
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
    docNo: "TRO2506-010",
    status: "Pending Approval",
    details: [],
  },
  {
    id: "4",
    docNo: "TRO2506-011",
    status: "Rejected",
    details: [],
  },
];

export default function ApproveScreen() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [isOpenViewReject, setIsOpenViewReject] = useState<boolean>(false);
  const [isOpenViewApprove, setIsOpenViewApprove] = useState<boolean>(false);
  const [filter, setFilter] = useState<any>({});
  const navigation = useNavigation<any>();

  useEffect(() => {
    const onFilterChanged = (data: any) => {
      console.log(`${filterApprove} =====> `, data);
      setFilter(data);
    };
    emitter.on(filterApprove, onFilterChanged);
    return () => {
      emitter.off(filterApprove, onFilterChanged);
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
    navigation.navigate("Filter", { filter, statusName: "ประเภทเอกสาร" });
  };

  const goToDetail = (item: any) => {
    const { card } = item;
    navigation.navigate("ApproveDetail", { docNo: card.docNo });
  };

  return (
    <Fragment>
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
        title={"อนุมัติรายการ"}
        IconComponent={[
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
              docNo={card.docNo}
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
        <View style={{ padding: 16, marginBottom: 16, flexDirection: "row" }}>
          <CustomButtons
            color={theme.red}
            label="ปฏิเสธ"
            disabled={selectedIds.length === 0}
            onPress={() => {
              setIsOpenViewReject(true);
            }}
          />
          <CustomButtons
            color={theme.green}
            label="อนุมัติรายการ"
            disabled={selectedIds.length === 0}
            onPress={() => {
              setIsOpenViewApprove(true);
            }}
          />
        </View>
      </View>
    </Fragment>
  );
}
