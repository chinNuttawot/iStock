import { emitter, filterStockCheck, getDataStockCheck } from "@/common/emitter";
import CustomButton from "@/components/CustomButton";
import Header from "@/components/Header";
import ScanCard, { StatusType } from "@/components/ScanCard/ScanCard";
import EmptyState from "@/components/State/EmptyState";
import ErrorState from "@/components/State/ErrorState";
import LoadingView from "@/components/State/LoadingView";
import { theme } from "@/providers/Theme";
import { cardListIStockService } from "@/service";
import { CardListModel, RouteParams } from "@/service/myInterface";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./Styles";

type StockCardDetail = { label: string; value: string };
type StockCardModel = {
  id: string;
  docNo: string;
  status: string; // หรือใช้ StatusType ถ้า ScanCard บังคับ enum
  details: StockCardDetail[];
};

export default function StockCheckScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { menuId }: RouteParams = route.params || {};
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<any>({});
  const [cardData, setCardData] = useState<StockCardModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const textGray = (theme as any).textGray ?? (theme as any).gray ?? "#9ca3af";
  const errorColor = (theme as any).error ?? "#ef4444";

  // รับ filter event
  useEffect(() => {
    const onFilterChanged = (data: any) => setFilter(data);
    emitter.on(filterStockCheck, onFilterChanged);
    return () => emitter.off(filterStockCheck, onFilterChanged);
  }, []);

  useEffect(() => {
    const onFilterChanged = (data: any) => {
      fetchData();
    };
    emitter.on(getDataStockCheck, onFilterChanged);
    return () => emitter.off(getDataStockCheck, onFilterChanged);
  }, []);

  // โหลดข้อมูล (ตอนนี้ใช้ mock)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const menuIdNum = Number(menuId);
      if (Number.isNaN(menuIdNum)) throw new Error("menuId ไม่ถูกต้อง");
      const { data } = await cardListIStockService({
        menuId: menuIdNum,
      });
      setCardData(Array.isArray(data) ? (data as CardListModel[]) : []);
    } catch (err: any) {
      setError(err?.message ?? "เกิดข้อผิดพลาดในการดึงข้อมูล");
      setCardData([]);
    } finally {
      setLoading(false);
    }
  }, [menuId]);

  useEffect(() => {
    setSelectedIds([]);
    setExpandedIds([]);
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchData();
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
    (card: StockCardModel) => {
      navigation.navigate("StockCheckDetail", { docNo: card.docNo, menuId: 3 });
    },
    [navigation]
  );

  const goToCreateDocument = useCallback(() => {
    // ถ้าต้องการแยก route สำหรับตรวจนับ ควรตั้งเป็น "CreateDocumentStockCheck"
    navigation.navigate("CreateDocumentStockCheck", { menuId: 3 });
  }, [navigation]);

  return (
    <>
      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
        title={"สแกน-ตรวจนับ"}
        IconComponent={[
          <TouchableOpacity key="plus" onPress={goToCreateDocument}>
            <MaterialCommunityIcons name="plus" size={30} color="white" />
          </TouchableOpacity>,
          <TouchableOpacity key="filter" onPress={openFilter}>
            <MaterialCommunityIcons
              name={filter?.isFilter ? "filter-check" : "filter"}
              size={30}
              color="white"
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
            onRetry={fetchData}
            color={errorColor}
            accentColor={theme.mainApp}
          />
        )}

        {!loading && !error && totalItems === 0 && (
          <EmptyState
            title="ไม่พบรายการ"
            subtitle="ลองปรับตัวกรอง หรือแตะปุ่มด้านล่างเพื่อรีโหลดข้อมูล"
            icon="clipboard-search-outline"
            color={textGray}
            actionLabel="รีโหลด"
            onAction={fetchData}
            buttonBg={theme.mainApp}
            buttonTextColor={theme.white}
          />
        )}

        {!loading && !error && totalItems > 0 && (
          <>
            <ScrollView
              contentContainerStyle={styles.content}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
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
                  id={card.id}
                  docNo={card.docNo}
                  status={card.status as StatusType}
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
                onPress={() => {
                  // TODO: ส่ง selectedIds ไป endpoint
                }}
              />
            </View>
          </>
        )}
      </View>
    </>
  );
}
