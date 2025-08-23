import { emitter, filterScanIn } from "@/common/emitter";
import CustomButton from "@/components/CustomButton";
import Header from "@/components/Header";
import ScanCard, { StatusType } from "@/components/ScanCard/ScanCard";
import EmptyState from "@/components/State/EmptyState";
import ErrorState from "@/components/State/ErrorState";
import LoadingView from "@/components/State/LoadingView";
import { theme } from "@/providers/Theme";
import { cardListService, getProfile } from "@/service";
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
type Nav = ReturnType<typeof useNavigation<any>>;

export default function ScanInScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const { menuId }: RouteParams = route.params || {};

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [cardData, setCardData] = useState<CardListModel[]>([]);
  const [filter, setFilter] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const textGray = (theme as any).textGray ?? (theme as any).gray ?? "#9ca3af";
  const errorColor = (theme as any).error ?? "#ef4444";

  // โหลดข้อมูลครั้งแรก + เมื่อ menuId เปลี่ยน
  useEffect(() => {
    fetchData();
    // reset selection เมื่อ list เปลี่ยน context
    setSelectedIds([]);
    setExpandedIds([]);
  }, [menuId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await getProfile();
      const menuIdNum = Number(menuId);
      if (Number.isNaN(menuIdNum)) throw new Error("menuId ไม่ถูกต้อง");

      const { data } = await cardListService({
        menuId: menuIdNum,
        branchCode: profile?.branchCode as string,
      });
      setCardData(Array.isArray(data) ? (data as CardListModel[]) : []);
    } catch (err: any) {
      setError(err?.message ?? "เกิดข้อผิดพลาดในการดึงข้อมูล");
      setCardData([]);
    } finally {
      setLoading(false);
    }
  }, [menuId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  }, [fetchData]);

  // รับ filter จากหน้าฟิลเตอร์
  useEffect(() => {
    const onFilterChanged = (data: any) => {
      // console.log(`${filterScanIn} =====> `, data);
      setFilter(data);
    };
    emitter.on(filterScanIn, onFilterChanged);
    return () => {
      emitter.off(filterScanIn, onFilterChanged);
    };
  }, []);

  // ป้องกันพังเมื่อ cardData ยังโหลดไม่เสร็จ
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
      prev.length === cardData.length ? [] : cardData.map((item) => item.id)
    );
  }, [cardData]);

  const openFilter = useCallback(() => {
    setSelectedIds([]);
    navigation.navigate("Filter", { filter });
  }, [filter, navigation]);

  const goToDetail = useCallback(
    (item: CardListModel) => {
      navigation.navigate("ScanInDetail", { docNo: item.docNo });
    },
    [navigation]
  );

  return (
    <>
      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
        title={"สแกน-รับ"}
        IconComponent={[
          <TouchableOpacity
            key="filter"
            onPress={openFilter}
            accessibilityRole="button"
            accessibilityLabel="เปิดฟิลเตอร์"
          >
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
            onRetry={fetchData}
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
                  isSelected={selectedIds.includes(card.id)}
                  isExpanded={expandedIds.includes(card.id)}
                  onSelect={toggleSelect}
                  onExpand={toggleExpand}
                  goTo={() => goToDetail(card)}
                />
              ))}
            </ScrollView>

            {/* Fixed bottom button */}
            <View style={{ padding: 16, marginBottom: 16 }}>
              <CustomButton
                label="ส่งเอกสาร"
                disabled={selectedIds.length === 0}
                onPress={() => {
                  // TODO: submit action
                }}
              />
            </View>
          </>
        )}
      </View>
    </>
  );
}
