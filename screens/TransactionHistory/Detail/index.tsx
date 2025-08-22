import { emitter, filterTransactionHistoryDetail } from "@/common/emitter";
import CustomButton from "@/components/CustomButton";
import DetailCard from "@/components/DetailCard";
import Header from "@/components/Header";
import { ProductItem } from "@/dataModel/ScanIn/Detail";
import ModalComponent from "@/providers/Modal";
import { theme } from "@/providers/Theme";
import { keyboardTypeNumber } from "@/screens/Register/register";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { styles } from "./styles";

export const productData = [
  {
    id: "1",
    docNo: "5OTH01475",
    model: "VR001",
    receivedQty: 1,
    totalQty: 5,
    details: [
      { label: "รุ่น", value: "VR000" },
      {
        label: "หมายเหตุ",
        value: "ของเล่น ลาโพงน้องหมา M10",
      },
      { label: "จำนวนที่รับ", value: null },
    ],
    image: "https://picsum.photos/seed/shirt/100/100",
  },
  {
    id: "2",
    docNo: "5OTH01475",
    model: "VR001",
    receivedQty: 0,
    totalQty: 4,
    details: [
      { label: "รุ่น", value: "VR001" },
      {
        label: "หมายเหตุ",
        value: "ของเล่น น้องแมว M20",
      },
      { label: "จำนวนที่รับ", value: null },
    ],
    image: "https://picsum.photos/seed/shirt/100/100",
  },
  {
    id: "3",
    docNo: "5OTH01475",
    model: "VR002",
    receivedQty: 2,
    totalQty: 5,
    details: [
      { label: "รุ่น", value: "VR002" },
      {
        label: "หมายเหตุ",
        value: "ของเล่น น้องกระต่าย M30",
      },
      { label: "จำนวนที่รับ", value: null },
    ],
    image: "https://picsum.photos/seed/shirt/100/100",
  },
];

export default function TransactionHistoryDetailScreen() {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<any>({});
  const [isOpen, setIsOpen] = useState(false);
  const [itemDetail, setItemDetail] = useState({});
  const navigation = useNavigation<any>();
  const route = useRoute();
  const scanInDetailForm = useForm();
  const { docNo } = route.params as { docNo: string };

  useEffect(() => {
    const onFilterChanged = (data: any) => {
      console.log(`${filterTransactionHistoryDetail} =====> `, data);
      setFilter(data);
    };
    emitter.on(filterTransactionHistoryDetail, onFilterChanged);
    return () => {
      emitter.off(filterTransactionHistoryDetail, onFilterChanged);
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

  const onShowDetail = (item: ProductItem) => {
    setItemDetail(item);
    setIsOpen(true);
  };
  const onSavedataDetail = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onBackdropPress = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const Render = memo((props: any) => {
    const [qty, setQty] = useState("");
    const [serialNo, setSerialNo] = useState("");
    const {
      receivedQty,
      totalQty,
      docNo: myDocId,
      model: myModel,
    } = props.itemDetail;

    useEffect(() => {
      const currentQty = scanInDetailForm.getValues(
        `newReceivedQty-docNo-${myDocId}-model-${myModel}`
      );

      if (currentQty) {
        setQty(currentQty);
      } else {
        setQty("");
      }
    }, [myDocId, myModel]);

    useEffect(() => {
      const currentserialNo = scanInDetailForm.getValues(
        `serialNo-docNo-${myDocId}-model-${myModel}`
      );

      if (currentserialNo) {
        setSerialNo(currentserialNo);
      } else {
        setSerialNo("");
      }
    }, [myDocId, myModel]);

    return (
      <View style={{ width: "100%" }}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {`จำนวนที่เพิ่มได้ไม่เกิน `}
            <Text style={styles.Sublabel}>{`${totalQty - receivedQty}`}</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={qty}
              keyboardType={keyboardTypeNumber}
              onChangeText={(text) => {
                const num = Number(text);
                if (!isNaN(num) && num <= totalQty - receivedQty) {
                  setQty(text);
                }
              }}
              style={styles.input}
            />
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{`Serial No`}</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={serialNo}
              onChangeText={(text) => {
                setSerialNo(text);
              }}
              style={styles.input}
            />
          </View>
        </View>
        <View style={{ paddingHorizontal: 64 }}>
          <CustomButton
            label="บันทึก"
            onPress={() => {
              scanInDetailForm.setValue(
                `newReceivedQty-docNo-${myDocId}-model-${myModel}`,
                qty
              );
              scanInDetailForm.setValue(
                `serialNo-docNo-${myDocId}-model-${myModel}`,
                serialNo
              );
              props.onChange && props.onChange(false);
            }}
          />
        </View>
      </View>
    );
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.white }}>
      <ModalComponent
        isOpen={isOpen}
        onChange={onSavedataDetail}
        option={{ change: { label: "ยืนยัน", color: theme.mainApp } }}
        hideCustomButtons={true}
        onBackdropPress={onBackdropPress}
      >
        <Render itemDetail={itemDetail} onChange={onSavedataDetail} />
      </ModalComponent>
      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
        title={docNo}
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
        {productData.map((item) => (
          <DetailCard
            key={item.id}
            data={item}
            viewMode
            isExpanded={expandedIds.includes(item.id)}
            onToggle={() => toggleExpand(item.id)}
            goTo={() => {
              onShowDetail(item);
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
}
