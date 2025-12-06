import { emitter, filterScanInDetail, getDataScanIn } from "@/common/emitter";
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
} from "@/service";
import { CardListModel } from "@/service/myInterface";
import draftCache from "@/utils/draftCache";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
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

  // โหลด draft ทุกครั้งที่กลับมาหน้านี้
  useFocusEffect(
    useCallback(() => {
      // หน่วงเวลาเล็กน้อยเพื่อให้ AsyncStorage ทันโหลดข้อมูล
      const timer = setTimeout(() => {
        loadDraftData();
      }, 100);
      return () => clearTimeout(timer);
    }, [docNo])
  );

  // โหลด draft ข้อมูลจาก Global Cache
  const loadDraftData = async () => {
    try {
      const draftKey = `scanin_draft_${docNo}`;
      const draftData = await draftCache.get(draftKey);

      if (draftData) {
        // โหลดข้อมูลกลับเข้า form
        Object.entries(draftData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            scanInDetailForm.setValue(key, value);
          }
        });
      } else {
      }
    } catch (error) {}
  };

  // บันทึก draft ข้อมูลลง Global Cache
  const saveDraftData = async () => {
    try {
      const draftKey = `scanin_draft_${docNo}`;
      const formValues = scanInDetailForm.getValues();

      // กรองเฉพาะค่าที่ไม่ใช่ undefined/null/''
      const filteredValues = Object.entries(formValues).reduce(
        (acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>
      );

      await draftCache.set(draftKey, filteredValues);
      // Verify
      const verify = await draftCache.get(draftKey);
    } catch (error) {}
  };

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

  const Render = (props: any) => {
    const [qty, setQty] = useState("");
    const [serialNo, setSerialNo] = useState("");
    const {
      qtyReceived,
      qtyShipped,
      docNo: myDocId,
      model: myModel,
      lineNo,
    } = props.itemDetail || {};

    const disabled = qtyShipped - qtyReceived === 0;

    // sync qty และ serialNo จาก form เมื่อ modal เปิด
    useEffect(() => {
      // รันเฉพาะตอน modal เปิด
      if (!props.isOpen || !myDocId) return;

      scanInDetailForm.setValue(
        `${myDocId}_lineNo_${myModel}_${lineNo}`,
        lineNo
      );

      const qtyKey = `${myDocId}_qty_${myModel}_${lineNo}`;
      const serialKey = `${myDocId}_serialNo_${myModel}_${lineNo}`;
      const currentQty = scanInDetailForm.getValues(qtyKey);
      const currentSerialNo = scanInDetailForm.getValues(serialKey);

      setQty((currentQty as string) || "");
      setSerialNo((currentSerialNo as string) || "");
    }, [myDocId, myModel, lineNo, props.isOpen]);

    // แจ้งเตือนเมื่อ disabled
    useEffect(() => {
      if (!disabled) return;

      Alert.alert(
        "ไม่สามารถทำรายการได้",
        "จำนวนคงเหลือไม่เพียงพอ สำหรับทำรายการ",
        [
          {
            text: "ตกลง",
            onPress: () => {
              props.onChange && props.onChange(false);
            },
          },
        ]
      );

      props.onChange && props.onChange(false);
    }, [disabled, props.onChange]);

    // ถ้าจำนวนเป็น 0 ก็ไม่ต้อง render UI อะไร
    if (disabled) {
      return null;
    }

    if (!myDocId) return null;

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
                const maxCanAdd = qtyShipped - qtyReceived;
                if (text === "") {
                  setQty(text);
                } else if (!isNaN(num) && num >= 0) {
                  if (num <= maxCanAdd) {
                    setQty(text);
                  } else {
                    Alert.alert(
                      "จำนวนเกินที่กำหนด",
                      `จำนวนที่รับได้สูงสุดคือ ${maxCanAdd} ชิ้น`,
                      [{ text: "ตกลง" }]
                    );
                  }
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
            onPress={async () => {
              const qtyKey = `${myDocId}_qty_${myModel}_${lineNo}`;
              const serialKey = `${myDocId}_serialNo_${myModel}_${lineNo}`;
              // บันทึกลง form
              scanInDetailForm.setValue(qtyKey, qty);
              scanInDetailForm.setValue(serialKey, serialNo);

              // บันทึก draft ทุกครั้งที่ปิด modal (รอให้ setValue เสร็จก่อน)
              await saveDraftData();

              // รอให้ AsyncStorage เขียนข้อมูลเสร็จก่อนปิด modal
              await new Promise((resolve) => setTimeout(resolve, 100));

              props.onChange && props.onChange(false);
            }}
          />
        </View>
      </View>
    );
  };

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

      type ProductRowLocal = {
        productCode: string;
        model: string;
        quantity: string;
        serialNo: string;
        lineNo: number;
      };

      const grouped: Record<string, ProductRowLocal> = Object.entries(
        rawValues
      ).reduce((acc, [key, value]) => {
        const m = keyPattern.exec(key);
        if (!m || !m.groups) return acc;

        const { productCode, field, model, lineNo } = m.groups as {
          productCode: string;
          field: "qty" | "serialNo" | "lineNo";
          model: string;
          lineNo: string;
        };

        const rowKey = `${productCode}_${model}_${lineNo}`;
        const val = String(value ?? "");

        if (!acc[rowKey]) {
          acc[rowKey] = {
            productCode,
            model,
            quantity: "",
            serialNo: "",
            lineNo: parseInt(lineNo, 10) || 0,
          };
        }

        if (field === "qty") acc[rowKey].quantity = val;
        else if (field === "serialNo") acc[rowKey].serialNo = val;
        else if (field === "lineNo") {
          const n = parseInt(val, 10);
          acc[rowKey].lineNo = Number.isFinite(n) ? n : acc[rowKey].lineNo;
        }

        return acc;
      }, {} as Record<string, ProductRowLocal>);

      const products: ProductRowLocal[] = Object.values(grouped);
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
      
      emitter.emit(getDataScanIn);

      // ⛔️ ไม่ลบ draft แล้ว เพื่อให้กลับหน้าแรกแล้วเข้ามาใหม่ยังเห็นค่าที่กรอกไว้
      // const draftKey = `scanin_draft_${docNo}`;
      // draftCache.delete(draftKey);

      // ⛔️ ไม่ reset form เพื่อให้ค่าปัจจุบันยังอยู่ใน form แล้วเราเอาไป saveDraft ได้
      // scanInDetailForm.reset();

      // เซฟค่าปัจจุบันลง draft อีกครั้ง (ค่าที่บันทึกล่าสุด)
      await saveDraftData();

      // Refresh ข้อมูลจาก backend
      await fetchData();

      Alert.alert("สำเร็จ", "บันทึกข้อมูลเรียบร้อยแล้ว", [
        {
          text: "กลับไปหน้าแรก",
          onPress: () => navigation.goBack(),
        },
        {
          text: "ทำรายการต่อ",
          style: "cancel",
        },
      ]);
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
        <Render
          itemDetail={itemDetail}
          onChange={onSavedataDetail}
          isOpen={isOpen}
        />
      </ModalComponent>

      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
        title={docNo}
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
              goTo={(res) => {
                if (res.mode === "edit") {
                  // future edit mode
                } else {
                  onShowDetail(item as any);
                }
              }}
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
