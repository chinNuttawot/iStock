import { emitter, filterScanInDetail } from "@/common/emitter";
import CustomButton from "@/components/CustomButton";
import DetailCard from "@/components/DetailCard";
import Header from "@/components/Header";
import QuantitySerialModal from "@/components/Modals/QuantitySerialModal";
import EmptyState from "@/components/State/EmptyState";
import { ProductItem } from "@/dataModel/ScanIn/Detail";
import ModalComponent from "@/providers/Modal";
import { theme } from "@/providers/Theme";
import { keyboardTypeNumber } from "@/screens/Register/register";
import { cardDetailListService } from "@/service";
import { CardListModel } from "@/service/myInterface";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { memo, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "./styles";

function parseKey(
  key: string
): { docNo: string; field: string; itemNo: string } | null {
  const last = key.lastIndexOf("_");
  if (last < 0) return null;
  const second = key.lastIndexOf("_", last - 1);
  if (second < 0) return null;
  const docNo = key.slice(0, second);
  const field = key.slice(second + 1, last);
  const itemNo = key.slice(last + 1);
  if (!docNo || !field || !itemNo) return null;
  return { docNo, field, itemNo };
}

type ItemFields = Record<string, string>;
type OutputDoc = { [docNo: string]: Array<{ [itemNo: string]: ItemFields }> };
type FinalOutput = OutputDoc[];

function transformFlatToDesired(
  input: Record<string, unknown>,
  onlyDocNo?: string
): FinalOutput {
  const grouped: Record<string, Record<string, ItemFields>> = {};

  for (const [k, v] of Object.entries(input)) {
    const parsed = parseKey(k);
    if (!parsed) continue;
    const { docNo, field, itemNo } = parsed;
    if (onlyDocNo && docNo !== onlyDocNo) continue;

    grouped[docNo] ||= {};
    grouped[docNo][itemNo] ||= {};
    grouped[docNo][itemNo][field] = String(v ?? "");
  }

  return Object.entries(grouped).map(([docNo, itemsObj]) => {
    const itemsArr = Object.entries(itemsObj).map(([itemNo, fields]) => ({
      [itemNo]: fields,
    }));
    return { [docNo]: itemsArr };
  });
}

export default function ScanInDetailScreen() {
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
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cardDetailData, setCardDetailData] = useState<CardListModel[]>([]);
  const { docNo } = route.params as { docNo: string };
  const textGray = (theme as any).textGray ?? (theme as any).gray ?? "#9ca3af";

  useEffect(() => {
    const onFilterChanged = (data: any) => {
      console.log(`${filterScanInDetail} =====> `, data);
      setFilter(data);
    };
    emitter.on(filterScanInDetail, onFilterChanged);
    return () => {
      emitter.off(filterScanInDetail, onFilterChanged);
    };
  }, []);

  useEffect(() => {
    fetchData();
    setExpandedIds([]);
  }, [docNo]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await cardDetailListService({
        menuId: 0,
        docNo: docNo,
      });
      setCardDetailData(Array.isArray(data) ? (data as CardListModel[]) : []);
    } catch (err: any) {
      setError(err?.message ?? "เกิดข้อผิดพลาดในการดึงข้อมูล");
      setCardDetailData([]);
    } finally {
      setLoading(false);
    }
  }, [docNo]);

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
        `${myDocId}_qty_${myModel}`
      );

      if (currentQty) {
        setQty(currentQty);
      } else {
        setQty("");
      }
    }, [myDocId, myModel]);

    useEffect(() => {
      const currentserialNo = scanInDetailForm.getValues(
        `${myDocId}_serialNo_${myModel}`
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
            disabled={!qty}
            onPress={() => {
              scanInDetailForm.setValue(`${myDocId}_qty_${myModel}`, qty);
              scanInDetailForm.setValue(
                `${myDocId}_serialNo_${myModel}`,
                serialNo
              );
              props.onChange && props.onChange(false);
            }}
          />
        </View>
      </View>
    );
  });
  
  const onSave = async () => {
    const rawValues = scanInDetailForm.getValues() as Record<string, unknown>;
    const payload = transformFlatToDesired(rawValues, docNo);
    console.log("scanInDetailForm raw ====>", payload[0]);
  };
  
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
        //   <TouchableOpacity
        //     onPress={() => {
        //       openFilter();
        //     }}
        //   >
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

      {cardDetailData.length === 0 && (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <EmptyState
            title="ไม่พบรายการ"
            subtitle=""
            icon="file-search-outline"
            color={textGray}
            actionLabel="รีโหลด"
            // onAction={fetchData}
            buttonBg={theme.mainApp}
            buttonTextColor={theme.white}
          />
        </View>
      )}
      {cardDetailData.length !== 0 && (
        <ScrollView contentContainerStyle={styles.content}>
          {cardDetailData.map((item) => (
            <DetailCard
              key={item.id}
              data={item as any}
              isExpanded={expandedIds.includes(item.id)}
              onToggle={() => toggleExpand(item.id)}
              goTo={() => onShowDetail(item as any)}
            />
          ))}
        </ScrollView>
      )}

      <View style={{ padding: 16, marginBottom: 16 }}>
        <CustomButton label="บันทึก" onPress={onSave} />
      </View>
    </View>
  );
}
