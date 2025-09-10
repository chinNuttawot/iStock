import {
  emitter,
  filterDataDashboard,
  filterScanOut,
  getDataScanOut,
} from "@/common/emitter";
import CustomButton from "@/components/CustomButton";
import Header from "@/components/Header";
import ScanCard, { StatusType } from "@/components/ScanCard/ScanCard";
import EmptyState from "@/components/State/EmptyState";
import ErrorState from "@/components/State/ErrorState";
import LoadingView from "@/components/State/LoadingView";
import { UploadPickerHandle } from "@/components/UploadPicker";
import { theme } from "@/providers/Theme";
import {
  cardListIStockBydocNoForTransactionHistoryService,
  cardListIStockService,
  getProfile,
  SendToApproveDocuments,
  transactionHistorySaveService,
} from "@/service";
import { CardListModel, RouteParams } from "@/service/myInterface";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./Styles";

export default function ScanOutScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { menuId }: RouteParams = route.params || {};

  // ✅ เก็บ refs ของ UploadPicker แยกตาม docNo
  const uploadRefs = useRef<Record<string, UploadPickerHandle | null>>({});

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<any>({});
  const [cardData, setCardData] = useState<CardListModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isload, setIsload] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const textGray = (theme as any).textGray ?? (theme as any).gray ?? "#9ca3af";
  const errorColor = (theme as any).error ?? "#ef4444";

  // รับ filter event
  useEffect(() => {
    const onFilterChanged = (data: any) => {
      if (data.isFilter) {
        if (data.status === "All") {
          const { status, ...newData } = data;
          fetchData(newData);
        }
        fetchData(data);
      } else {
        fetchData();
      }
      setFilter(data);
    };
    emitter.on(filterScanOut, onFilterChanged);
    return () => emitter.off(filterScanOut, onFilterChanged);
  }, []);

  useEffect(() => {
    const onFilterChanged = (data: any) => {
      fetchData();
    };
    emitter.on(getDataScanOut, onFilterChanged);
    return () => emitter.off(getDataScanOut, onFilterChanged);
  }, []);

  // โหลดข้อมูล
  const fetchData = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const menuIdNum = Number(menuId);
        if (Number.isNaN(menuIdNum)) throw new Error("menuId ไม่ถูกต้อง");
        const { data } = await cardListIStockService({
          ...params,
          menuId: menuIdNum,
        });
        setCardData(Array.isArray(data) ? (data as CardListModel[]) : []);
      } catch (err: any) {
        setError(err?.message ?? "เกิดข้อผิดพลาดในการดึงข้อมูล");
        setCardData([]);
      } finally {
        setLoading(false);
      }
    },
    [menuId]
  );

  // โหลดข้อมูลครั้งแรก + เมื่อ menuId เปลี่ยน
  useEffect(() => {
    fetchData();
    setSelectedIds([]);
    setExpandedIds([]);
    uploadRefs.current = {}; // ล้าง refs เก่าเมื่อ list เปลี่ยน
  }, [menuId]);

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (filter.isFilter) {
        if (filter.status === "All") {
          const { status, ...newData } = filter;
          fetchData(newData);
        }
        fetchData(filter);
      } else {
        fetchData();
      }
    } finally {
      setRefreshing(false);
    }
  }, [fetchData]);

  const totalItems = cardData.length;
  const allSelected = useMemo(
    () => totalItems > 0 && selectedIds.length === totalItems,
    [selectedIds.length, totalItems]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (cardData.length === 0) return;
    setSelectedIds((prev) =>
      prev.length === cardData.length
        ? []
        : cardData
            .filter((item) => item.status === "Open")
            .map((item) => item.docNo)
    );
  }, [cardData]);

  const openFilter = useCallback(() => {
    setSelectedIds([]);
    navigation.navigate("Filter", { filter });
  }, [filter, navigation]);

  const goToDetail = useCallback(
    (card: CardListModel) => {
      navigation.navigate("ScanOutDetail", {
        docNo: card.docNo,
        menuId: 1,
        status: card.status,
      });
    },
    [navigation]
  );

  // ✅ เรียกอัปโหลดเฉพาะรายการที่เลือก โดยอิงจาก uploadRefs.current[docNo]
  const submitSelected = useCallback(async () => {
    try {
      if (selectedIds.length === 0) return;
      setIsload(true);
      let _selectedIds = selectedIds;
      setSelectedIds([]);
      const profile = await getProfile();
      for (const docNo of _selectedIds) {
        const handle = uploadRefs.current[docNo];
        await handle?.uploadAllInOneRequests?.();
        let { data } = await cardListIStockBydocNoForTransactionHistoryService({
          docNo,
        });
        data = [data].map((v: any) => ({
          ...v,
          createdBy: profile?.userName,
          status: "Pending Approval",
        }))[0];
        await transactionHistorySaveService(data);
      }
      await SendToApproveDocuments({ docNo: _selectedIds.join("|") });
      emitter.emit(getDataScanOut);
      emitter.emit(filterDataDashboard);
    } catch (err) {
      Alert.alert("เกิดข้อผิดพลาด", "ลองใหม่อีกครั้ง");
    } finally {
      setSelectedIds([]);
      setIsload(false);
    }
  }, [selectedIds]);

  // ไปหน้าสร้างเอกสารใหม่ (Scan-Out)
  const goToCreateDocument = useCallback(() => {
    navigation.navigate("CreateDocumentScanOut", { menuId: 1 });
  }, [navigation]);

  return (
    <>
      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
        title={"สแกน-ออก"}
        IconComponent={[
          <TouchableOpacity key="plus" onPress={goToCreateDocument}>
            <MaterialCommunityIcons name="plus" size={30} color={theme.white} />
          </TouchableOpacity>,
          <TouchableOpacity key="filter" onPress={openFilter}>
            <MaterialCommunityIcons
              name={filter?.isFilter ? "filter-check" : "filter"}
              size={30}
              color={theme.white}
            />
          </TouchableOpacity>,
        ]}
      />

      <View style={{ flex: 1, backgroundColor: theme.white }}>
        {loading && (
          <LoadingView
            message="กำลังโหลดข้อมูล…"
            color={theme.mainApp}
            textColor={textGray}
          />
        )}

        {!loading && error && (
          <ErrorState
            message={error}
            onRetry={onRefresh}
            color={errorColor}
            accentColor={theme.mainApp}
          />
        )}

        {!loading && !error && totalItems === 0 && (
          <EmptyState
            title="ไม่พบรายการ"
            subtitle="ลองปรับตัวกรอง หรือแตะปุ่มด้านล่างเพื่อรีโหลดข้อมูล"
            icon="file-search-outline"
            color={textGray}
            actionLabel="รีโหลด"
            onAction={onRefresh}
            buttonBg={theme.mainApp}
            buttonTextColor={theme.white}
          />
        )}

        {!loading && !error && totalItems > 0 && (
          <>
            <ScrollView
              contentContainerStyle={styles.content}
              // refreshControl={
              //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              // }
            >
              <TouchableOpacity
                onPress={handleSelectAll}
                disabled={cardData.length === 0}
              >
                <Text style={styles.selectAllText}>
                  {allSelected ? "ยกเลิก" : "เลือกทั้งหมด"}
                </Text>
              </TouchableOpacity>

              {cardData.map((card) => (
                <ScanCard
                  key={card.id}
                  ref={(h) => {
                    uploadRefs.current[card.docNo] = h;
                  }}
                  id={card.docNo}
                  hideAddFile={card.status !== "Open"}
                  keyRef1={card.docNo}
                  keyRef2={null}
                  keyRef3={null}
                  remark={null}
                  docNo={card.docNo}
                  date={card.date}
                  status={card.status as StatusType}
                  hideSelectedIds={card.status !== "Open"}
                  details={card.details}
                  selectedIds={selectedIds}
                  isSelected={selectedIds.includes(card.docNo)}
                  isExpanded={expandedIds.includes(card.docNo)}
                  onSelect={toggleSelect}
                  onExpand={toggleExpand}
                  goTo={() => goToDetail(card)}
                />
              ))}
            </ScrollView>

            <View style={{ padding: 16, marginBottom: 16 }}>
              <CustomButton
                isload={isload}
                label="ส่งเอกสาร"
                disabled={selectedIds.length === 0}
                onPress={submitSelected}
              />
            </View>
          </>
        )}
      </View>
    </>
  );
}
