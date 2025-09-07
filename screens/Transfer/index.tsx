// screens/TransferScreen.tsx
import {
  emitter,
  filterDataDashboard,
  filterTransfer,
  getDataTransfer,
} from "@/common/emitter";
import CustomButton from "@/components/CustomButton";
import Header from "@/components/Header";
import ScanCard, { StatusType } from "@/components/ScanCard/ScanCard";
import EmptyState from "@/components/State/EmptyState";
import ErrorState from "@/components/State/ErrorState";
import LoadingView from "@/components/State/LoadingView";
import type { UploadPickerHandle } from "@/components/UploadPicker";
import { theme } from "@/providers/Theme";
import { cardListIStockService, SendToApproveDocuments } from "@/service";
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
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./Styles";

type Nav = ReturnType<typeof useNavigation<any>>;

export default function TransferScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const { menuId }: RouteParams = route.params || {}; // ควรเป็น 2 สำหรับโอนย้าย

  // ✅ อ้างอิง UploadPicker ต่อการ์ดผ่าน docNo
  const uploadRefs = useRef<Record<string, UploadPickerHandle | null>>({});

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<any>({});
  const [cardData, setCardData] = useState<CardListModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const textGray = (theme as any).textGray ?? (theme as any).gray ?? "#9ca3af";
  const errorColor = (theme as any).error ?? "#ef4444";

  // ====== รับค่า filter ======
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
    emitter.on(filterTransfer, onFilterChanged);
    return () => emitter.off(filterTransfer, onFilterChanged);
  }, []);

  useEffect(() => {
    const onAskReload = () => fetchData();
    emitter.on(getDataTransfer, onAskReload);
    return () => emitter.off(getDataTransfer, onAskReload);
  }, []);

  // ====== โหลดข้อมูล ======
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
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "เกิดข้อผิดพลาดในการดึงข้อมูล";
        console.log("Transfer fetchData error:", err?.response?.data || err);
        setCardData([]);
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [menuId]
  );

  useEffect(() => {
    setSelectedIds([]);
    setExpandedIds([]);
    uploadRefs.current = {}; // ล้าง ref เก่าเมื่อ context เปลี่ยน
    fetchData();
  }, [fetchData]);

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

  // ====== เลือกทั้งหมดเฉพาะที่ Open ======
  const selectableIds = useMemo(
    () => cardData.filter((i) => i.status === "Open").map((i) => i.docNo),
    [cardData]
  );
  const allSelected = useMemo(
    () =>
      selectableIds.length > 0 && selectedIds.length === selectableIds.length,
    [selectedIds, selectableIds]
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
    setSelectedIds((prev) =>
      prev.length === selectableIds.length ? [] : selectableIds
    );
  }, [selectableIds]);

  const openFilter = useCallback(() => {
    setSelectedIds([]);
    navigation.navigate("Filter", { filter });
  }, [filter, navigation]);

  const goToDetail = useCallback(
    (card: CardListModel) => {
      navigation.navigate("TransferDetail", {
        docNo: card.docNo,
        menuId: 2,
        status: card.status,
      });
    },
    [navigation]
  );

  // ====== ส่งเอกสาร: เรียกอัปโหลดจากการ์ดที่เลือก ======
  const submitSelected = useCallback(async () => {
    try {
      if (selectedIds.length === 0) return;

      for (const docNo of selectedIds) {
        const handle = uploadRefs.current[docNo];
        await handle?.uploadAllInOneRequests?.();
      }
      await SendToApproveDocuments({ docNo: selectedIds.join("|") });
    } finally {
      setSelectedIds([]);
      emitter.emit(getDataTransfer);
      emitter.emit(filterDataDashboard);
    }
  }, [selectedIds]);

  const goToCreateDocument = useCallback(() => {
    navigation.navigate("CreateDocumentTransfer", { menuId: 2 });
  }, [navigation]);

  return (
    <>
      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
        title={"สแกน-โอนย้าย"}
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

        {!loading && !error && cardData.length === 0 && (
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

        {!loading && !error && cardData.length > 0 && (
          <>
            <ScrollView
              contentContainerStyle={styles.content}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              <TouchableOpacity
                onPress={handleSelectAll}
                disabled={selectableIds.length === 0}
              >
                <Text style={styles.selectAllText}>
                  {allSelected ? "ยกเลิก" : "เลือกทั้งหมด"}
                </Text>
              </TouchableOpacity>

              {cardData.map((card) => (
                <ScanCard
                  key={card.id}
                  // ✅ ผูก ref ตัวอัปโหลดกับ docNo
                  ref={(h) => {
                    uploadRefs.current[card.docNo] = h;
                  }}
                  id={card.id}
                  // ✅ ส่ง keyRef ให้ UploadPicker ภายในการ์ดใช้ดึง/แสดงไฟล์เดิม
                  keyRef1={card.docNo}
                  hideAddFile={card.status !== "Open"}
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
