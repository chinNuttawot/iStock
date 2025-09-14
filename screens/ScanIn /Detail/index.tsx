import { emitter, filterScanInDetail, getDataScanOut } from "@/common/emitter";
import CustomButton from "@/components/CustomButton";
import DetailCard from "@/components/DetailCard";
import Header from "@/components/Header";
import EmptyState from "@/components/State/EmptyState";
import { ProductItem } from "@/dataModel/ScanIn/Detail";
import ModalComponent from "@/providers/Modal";
import { theme } from "@/providers/Theme";
import { keyboardTypeNumber } from "@/screens/Register/register";
import {
  binCodesByLocationService,
  cardDetailListService,
  Profile,
  saveDocumentsNAVService,
  transactionHistorySaveService,
} from "@/service";
import { CardListModel } from "@/service/myInterface";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { memo, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "./styles";

type ScanFormValues = Record<string, unknown>;

type ProductRow = {
  productCode: string;
  quantity: string; // เก็บเป็น string ตามฟอร์ม
  serialNo: string;
  lineNo: number;
};

export default function ScanInDetailScreen() {
  const [itemDetail, setItemDetail] = useState<{
    docNo: string;
    model: string;
    qtyReceived: number;
    qtyShipped: number;
    lineNo: number;
  } | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<any>({});
  const [isOpen, setIsOpen] = useState(false);
  const navigation = useNavigation<any>();
  const route = useRoute();
  const scanInDetailForm = useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [isload, setIsload] = useState<boolean>(false);
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
      lineNo: item.lineNo,
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
      lineNo,
    } = props.itemDetail;

    useEffect(() => {
      scanInDetailForm.setValue(
        `${myDocId}_lineNo_${myModel}_${lineNo}`,
        lineNo
      );
      const currentQty = scanInDetailForm.getValues(
        `${myDocId}_qty_${myModel}_${lineNo}`
      );

      if (currentQty) {
        setQty(currentQty);
      } else {
        setQty("");
      }
    }, [myDocId, myModel]);

    useEffect(() => {
      const currentserialNo = scanInDetailForm.getValues(
        `${myDocId}_serialNo_${myModel}_${lineNo}`
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
              scanInDetailForm.setValue(
                `${myDocId}_qty_${myModel}_${lineNo}`,
                qty
              );
              scanInDetailForm.setValue(
                `${myDocId}_serialNo_${myModel}_${lineNo}`,
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
    try {
      setIsload(true);
      const rawValues = scanInDetailForm.getValues() as ScanFormValues;

      // ตัวอย่าง key:
      // DOC123_qty_NAUTILUS_1000
      // DOC123_serialNo_NAUTILUS_1000
      // DOC123_lineNo_NAUTILUS_1000
      const keyPattern =
        /^(?<productCode>[A-Za-z0-9]+)_(?<field>qty|serialNo|lineNo)_(?<model>[A-Za-z0-9]+)_(?<lineNo>\d+)$/;

      type ProductRow = {
        productCode: string;
        model: string; // ถ้า backend ยังไม่ต้องใช้ ลบ property นี้ออกได้
        quantity: string;
        serialNo: string;
        lineNo: number;
      };

      const grouped: Record<string, ProductRow> = Object.entries(
        rawValues
      ).reduce((acc, [key, value]) => {
        const m = keyPattern.exec(key);
        if (!m || !m.groups) return acc;

        const { productCode, field, model, lineNo } = m.groups as {
          productCode: string;
          field: "qty" | "serialNo" | "lineNo";
          model: string;
          lineNo: string; // มาจาก suffix ตามที่กำหนด
        };

        // ใช้ (productCode + model + lineNo จาก key) เป็นตัวรวม
        const rowKey = `${productCode}_${model}_${lineNo}`;
        const val = String(value ?? "");

        if (!acc[rowKey]) {
          acc[rowKey] = {
            productCode,
            model,
            quantity: "",
            serialNo: "",
            lineNo: parseInt(lineNo, 10) || 0, // ตั้งต้นจากค่าใน key
          };
        }

        if (field === "qty") acc[rowKey].quantity = val;
        else if (field === "serialNo") acc[rowKey].serialNo = val;
        else if (field === "lineNo") {
          // ถ้ามี field lineNo ในฟอร์ม ก็ยอมให้ override จากค่าที่ผู้ใช้กรอก
          const n = parseInt(val, 10);
          acc[rowKey].lineNo = Number.isFinite(n) ? n : acc[rowKey].lineNo;
        }

        return acc;
      }, {} as Record<string, ProductRow>);

      const products: ProductRow[] = Object.values(grouped);
      const profile = await Profile();

      const { data: dataBinCodesByLocationService } =
        await binCodesByLocationService({
          locationCodeFrom: profile.branchCode,
        });
      const payload = {
        docNo,
        products,
        username: profile.userName,
        branchCode: profile.branchCode,
        binCode: dataBinCodesByLocationService[0].value ?? "",
      };
      const { data } = await saveDocumentsNAVService(payload);
      await transactionHistorySaveService(data);
      emitter.emit(getDataScanOut);
      navigation.goBack();
    } catch (err) {
      Alert.alert("เกิดขอผิดพลาด", "ลองใหม่อีกครั้ง");
    } finally {
      setIsload(false);
    }
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
        <CustomButton label="บันทึก" onPress={onSave} isload={isload} />
      </View>
    </View>
  );
}
