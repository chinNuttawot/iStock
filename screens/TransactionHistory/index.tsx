import { emitter, filterTransactionHistory } from "@/common/emitter";
import Header from "@/components/Header";
import ScanCard, { StatusType } from "@/components/ScanCard/ScanCard";
import EmptyState from "@/components/State/EmptyState";
import ErrorState from "@/components/State/ErrorState";
import LoadingView from "@/components/State/LoadingView";
import { theme } from "@/providers/Theme";
import { cardListIStockService } from "@/service";
import { CardListModel } from "@/service/myInterface";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./Styles";

type THDetail = { label: string; value: string };
type THCard = {
  id: string;
  menuId: number;
  docNo: string;
  status: string;
  details: THDetail[];
};

export default function TransactionHistoryScreen() {
  const navigation = useNavigation<any>();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<any>({});
  const [cardData, setCardData] = useState<THCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textGray = (theme as any).textGray ?? (theme as any).gray ?? "#9ca3af";
  const errorColor = (theme as any).error ?? "#ef4444";

  useEffect(() => {
    const onFilterChanged = (d: any) => setFilter(d);
    emitter.on(filterTransactionHistory, onFilterChanged);
    return () => emitter.off(filterTransactionHistory, onFilterChanged);
  }, []);

  const fetchData = useCallback(async (option = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await cardListIStockService(option);
      setCardData(Array.isArray(data) ? (data as CardListModel[]) : []);
    } catch (err: any) {
      setError(err?.message ?? "เกิดข้อผิดพลาดในการดึงข้อมูล");
      setCardData([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const total = cardData.length;
  const allSelected = useMemo(
    () => total > 0 && selectedIds.length === total,
    [selectedIds.length, total]
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

  const openFilter = useCallback(() => {
    setSelectedIds([]);
    navigation.navigate("Filter", { filter, statusName: "ประเภทเอกสาร" });
  }, [filter, navigation]);

  const goToDetail = useCallback(
    (card: THCard) => {
      navigation.navigate("TransactionHistoryDetail", {
        docNo: card.docNo,
        menuId: card.menuId,
      });
    },
    [navigation]
  );

  return (
    <>
      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
        title="ประวัติการทำรายการ"
        IconComponent={[
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
        {!loading && !error && total === 0 && (
          <EmptyState
            title="ไม่พบรายการ"
            subtitle="ปรับตัวกรองหรือกดรีโหลดเพื่อดึงข้อมูลอีกครั้ง"
            icon="history"
            color={textGray}
            actionLabel="รีโหลด"
            onAction={fetchData}
            buttonBg={theme.mainApp}
            buttonTextColor={theme.white}
          />
        )}
        {!loading && !error && total > 0 && (
          <ScrollView
            contentContainerStyle={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* หน้า History ไม่ต้องเลือกทั้งหมด เลยไม่ใส่ปุ่ม select-all */}
            {cardData.map((card) => (
              <ScanCard
                key={card.id}
                id={card.id}
                docNo={card.docNo}
                status={card.status as StatusType}
                details={card.details}
                hideSelectedIds
                selectedIds={selectedIds}
                isSelected={selectedIds.includes(card.docNo)}
                isExpanded={expandedIds.includes(card.docNo)}
                onSelect={toggleSelect}
                onExpand={toggleExpand}
                goTo={() => goToDetail(card)}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </>
  );
}
