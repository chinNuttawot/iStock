import { emitter, filterTransactionHistoryDetail } from "@/common/emitter";
import CustomButton from "@/components/CustomButton";
import DetailCard from "@/components/DetailCard";
import Header from "@/components/Header";
import QuantitySerialModal from "@/components/Modals/QuantitySerialModal";
import { ProductItem } from "@/dataModel/ScanIn/Detail";
import ModalComponent from "@/providers/Modal";
import { theme } from "@/providers/Theme";
import { cardDetailIStockListService } from "@/service";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import { styles } from "./styles";

export default function TransactionHistoryDetailScreen() {
  const [itemDetail, setItemDetail] = useState<{
    docNo: string;
    model: string;
    qtyReceived: number;
    qtyShipped: number;
  } | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<any>({});
  const [isOpen, setIsOpen] = useState(false);
  const navigation = useNavigation<any>();
  const route = useRoute();
  const scanInDetailForm = useForm();
  const { docNo, menuId } = route.params as { docNo: string; menuId: number };
  const [productData, setProductData] = useState<ProductItem[]>([]);

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

  useEffect(() => {
    getDataDetail();
  }, []);

  const getDataDetail = async () => {
    try {
      const { data } = await cardDetailIStockListService({
        docNo,
        menuId: menuId,
      });
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

  const onShowDetail = (item: ProductItem) => {
    setItemDetail({
      docNo: item.docNo,
      model: item.model,
      qtyReceived: item.qtyReceived,
      qtyShipped: item.qtyShipped,
    });
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
      qtyReceived,
      qtyShipped,
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
            <Text style={styles.Sublabel}>{`${qtyShipped - qtyReceived}`}</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={qty}
              keyboardType={keyboardTypeNumber}
              onChangeText={(text) => {
                const num = Number(text);
                if (!isNaN(num) && num <= qtyShipped - qtyReceived) {
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
      <QuantitySerialModal
        isOpen={isOpen}
        item={itemDetail}
        onClose={() => setIsOpen(false)}
        form={scanInDetailForm}
        labelConfirm="ยืนยัน"
      />
      <ScrollView contentContainerStyle={styles.content}>
        {productData
          .filter((v) => !v.isDelete)
          .map((item) => (
            <DetailCard
              key={item.id}
              data={item}
              viewMode
              isExpanded={expandedIds.includes(item.id)}
              onToggle={() => toggleExpand(item.id)}
              textGoTo="ลบ"
              colorButton={theme.red}
              goTo={() => onShowDetail(item)}
            />
          ))}
      </ScrollView>
    </View>
  );
}
