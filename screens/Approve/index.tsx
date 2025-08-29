// screens/ApproveScreen.tsx
import { emitter, filterApprove } from "@/common/emitter";
import CustomButtons from "@/components/CustomButtons";
import Header from "@/components/Header";
import ScanCard, { StatusType } from "@/components/ScanCard/ScanCard";
import EmptyState from "@/components/State/EmptyState";
import ErrorState from "@/components/State/ErrorState";
import LoadingView from "@/components/State/LoadingView";
import ModalComponent from "@/providers/Modal";
import { theme } from "@/providers/Theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
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

type Detail = { label: string; value: string };
type Card = { id: string; docNo: string; status: string; details: Detail[] };

const mock: Card[] = [
  {
    id: "1",
    docNo: "TRO2506-079",
    status: "Open",
    details: [
      { label: "วันที่ตรวจนับ", value: "23/06/2025" },
      { label: "จัดทำโดย", value: "CHY" },
      { label: "หมายเหตุ", value: "ตัดเบิกโอเปอร์ประชุม ผจก. เดือน มิ.ย.68" },
    ],
  },
  { id: "2", docNo: "TRO2506-080", status: "Approved", details: [] },
  { id: "3", docNo: "TRO2506-010", status: "Pending Approval", details: [] },
  { id: "4", docNo: "TRO2506-011", status: "Rejected", details: [] },
];

export default function ApproveScreen() {
  const navigation = useNavigation<any>();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [isOpenReject, setOpenReject] = useState(false);
  const [isOpenApprove, setOpenApprove] = useState(false);
  const [filter, setFilter] = useState<any>({});
  const [cardData, setData] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textGray = (theme as any).textGray ?? (theme as any).gray ?? "#9ca3af";
  const errorColor = (theme as any).error ?? "#ef4444";

  useEffect(() => {
    const onFilterChanged = (d: any) => setFilter(d);
    emitter.on(filterApprove, onFilterChanged);
    return () => emitter.off(filterApprove, onFilterChanged);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 250));
      setData(mock);
    } catch (e: any) {
      setError(e?.message ?? "เกิดข้อผิดพลาดในการดึงข้อมูล");
      setData([]);
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

  // เลือกทั้งหมด: นับเฉพาะการ์ดที่ Open (ให้สอดคล้องทุกหน้า)
  const selectableIds = useMemo(
    () => cardData.filter((i) => i.status === "Open").map((i) => i.docNo),
    [cardData]
  );
  const allSelected = useMemo(
    () =>
      selectableIds.length > 0 && selectedIds.length === selectableIds.length,
    [selectedIds, selectableIds]
  );

  // ใช้ docNo เป็นตัวระบุการเลือก/ขยาย เพื่อให้ตรงกับ handleSelectAll
  const toggleSelect = useCallback((docNo: string) => {
    setSelectedIds((prev) =>
      prev.includes(docNo) ? prev.filter((i) => i !== docNo) : [...prev, docNo]
    );
  }, []);

  const toggleExpand = useCallback((docNo: string) => {
    setExpandedIds((prev) =>
      prev.includes(docNo) ? prev.filter((i) => i !== docNo) : [...prev, docNo]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === selectableIds.length ? [] : selectableIds
    );
  }, [selectableIds]);

  const openFilter = useCallback(() => {
    setSelectedIds([]);
    navigation.navigate("Filter", { filter, statusName: "ประเภทเอกสาร" });
  }, [filter, navigation]);

  const goToDetail = useCallback(
    (card: Card) => navigation.navigate("ApproveDetail", { docNo: card.docNo }),
    [navigation]
  );

  return (
    <Fragment>
      {/* Reject Modal */}
      <ModalComponent
        isOpen={isOpenReject}
        onChange={() => {}}
        onBackdropPress={() => setOpenReject(false)}
        option={{ change: { label: "ตกลง", color: theme.mainApp } }}
      >
        <View style={styles.mainView}>
          <Text
            style={[
              styles.label,
              {
                ...theme.setFont_Bold,
                textAlign: "center",
                padding: 8,
                fontSize: 20,
              },
            ]}
          >
            ปฏิเสธรายการ
          </Text>
          <Text
            style={[
              styles.label,
              { textAlign: "center", padding: 8, marginBottom: 26 },
            ]}
          >
            คุณต้องการที่จะปฏิเสธรายการที่เลือกหรือไม่
          </Text>
        </View>
      </ModalComponent>

      {/* Approve Modal */}
      <ModalComponent
        isOpen={isOpenApprove}
        onChange={() => {}}
        onBackdropPress={() => setOpenApprove(false)}
        option={{ change: { label: "ตกลง", color: theme.mainApp } }}
      >
        <View style={styles.mainView}>
          <Text
            style={[
              styles.label,
              {
                ...theme.setFont_Bold,
                textAlign: "center",
                padding: 8,
                fontSize: 20,
              },
            ]}
          >
            อนุมัติรายการ
          </Text>
          <Text
            style={[
              styles.label,
              { textAlign: "center", padding: 8, marginBottom: 26 },
            ]}
          >
            คุณต้องการที่จะอนุมัติรายการที่เลือกหรือไม่
          </Text>
        </View>
      </ModalComponent>

      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
        title="อนุมัติรายการ"
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

        {!loading && !error && cardData.length === 0 && (
          <EmptyState
            title="ไม่พบรายการ"
            subtitle="ปรับตัวกรองหรือกดรีโหลดเพื่อดึงข้อมูลอีกครั้ง"
            icon="clipboard-check-outline"
            color={textGray}
            actionLabel="รีโหลด"
            onAction={fetchData}
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
                  id={card.id}
                  // ✅ ส่ง keyRef ให้ UploadPicker ภายในการ์ด (เผื่อดูไฟล์แนบ/รูป)
                  keyRef1={card.docNo}
                  hideAddFile={true}
                  keyRef2={null}
                  keyRef3={null}
                  remark={null}
                  docNo={card.docNo}
                  status={card.status as StatusType}
                  details={card.details}
                  selectedIds={selectedIds}
                  // ✅ ใช้ docNo เป็นตัวอ้างอิง selection/expand ให้ตรงกับ select-all
                  isSelected={selectedIds.includes(card.docNo)}
                  isExpanded={expandedIds.includes(card.docNo)}
                  onSelect={toggleSelect}
                  onExpand={toggleExpand}
                  goTo={() => goToDetail(card)}
                />
              ))}
            </ScrollView>

            <View
              style={{
                padding: 16,
                marginBottom: 16,
                flexDirection: "row",
                gap: 12,
              }}
            >
              <CustomButtons
                color={theme.red}
                label="ปฏิเสธ"
                disabled={selectedIds.length === 0}
                onPress={() => setOpenReject(true)}
              />
              <CustomButtons
                color={theme.green}
                label="อนุมัติรายการ"
                disabled={selectedIds.length === 0}
                onPress={() => setOpenApprove(true)}
              />
            </View>
          </>
        )}
      </View>
    </Fragment>
  );
}
