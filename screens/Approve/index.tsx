// screens/ApproveScreen.tsx
import {
  emitter,
  filterApprove,
  filterDataDashboard,
  filterDataMenu,
  getDataApprove,
} from "@/common/emitter";
import CustomButtons from "@/components/CustomButtons";
import Header from "@/components/Header";
import ScanCard, { StatusType } from "@/components/ScanCard/ScanCard";
import EmptyState from "@/components/State/EmptyState";
import ErrorState from "@/components/State/ErrorState";
import LoadingView from "@/components/State/LoadingView";
import { UploadPickerHandle } from "@/components/UploadPicker";
import ModalComponent from "@/providers/Modal";
import { theme } from "@/providers/Theme";
import {
  ApproveDocumentsService,
  cardListIStockService,
  menuService,
} from "@/service";
import { CardListModel } from "@/service/myInterface";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, {
  Fragment,
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

export default function ApproveScreen() {
  const navigation = useNavigation<any>();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [isOpenReject, setOpenReject] = useState(false);
  const [isOpenApprove, setOpenApprove] = useState(false);
  const [filter, setFilter] = useState<any>({});
  const [cardData, setCardData] = useState<CardListModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [isload, setIsload] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ✅ ใช้ “แผนที่ของ refs” อ้างอิง UploadPicker ของแต่ละการ์ดตาม id
  const uploadRefs = useRef<Record<string, UploadPickerHandle | null>>({});
  const textGray = (theme as any).textGray ?? (theme as any).gray ?? "#9ca3af";
  const errorColor = (theme as any).error ?? "#ef4444";

  useEffect(() => {
    const onFilterChanged = (data: any) => {
      if (data.isFilter) {
        if (data.status === "All") {
          if (data.menuId === "All") {
            const { status, menuId, ...newData } = data;
            fetchData(newData);
          } else {
            const { status, ...newData } = data;
            fetchData(newData);
          }
        }
        if (data.menuId === "All") {
          if (data.status === "All") {
            const { status, menuId, ...newData } = data;
            fetchData(newData);
          } else {
            const { menuId, ...newData } = data;
            fetchData(newData);
          }
        }
        if (data.menuId !== "All" && data.status !== "All") {
          fetchData(data);
        }
      } else {
        fetchData();
      }
      setFilter(data);
    };
    emitter.on(filterApprove, onFilterChanged);
    return () => emitter.off(filterApprove, onFilterChanged);
  }, []);

  useEffect(() => {
    const onFilterChanged = (data: any) => {
      fetchData();
    };
    emitter.on(getDataApprove, onFilterChanged);
    return () => emitter.off(getDataApprove, onFilterChanged);
  }, []);

  const fetchData = useCallback(async (parmas = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await cardListIStockService(parmas);
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
      if (filter.isFilter) {
        if (filter.status === "All") {
          if (filter.menuId === "All") {
            const { status, menuId, ...newData } = filter;
            fetchData(newData);
          } else {
            const { status, ...newData } = filter;
            fetchData(newData);
          }
        }
        if (filter.menuId === "All") {
          if (filter.status === "All") {
            const { status, menuId, ...newData } = filter;
            fetchData(newData);
          } else {
            const { menuId, ...newData } = filter;
            fetchData(newData);
          }
        }
        if (filter.menuId !== "All" && filter.status !== "All") {
          fetchData(filter);
        }
      } else {
        fetchData();
      }
    } finally {
      setRefreshing(false);
    }
  }, [fetchData, filter]);

  // เลือกทั้งหมด: นับเฉพาะการ์ดที่ Open (ให้สอดคล้องทุกหน้า)
  const selectableIds = useMemo(
    () =>
      cardData
        .filter((i) => i.status === "Pending Approval")
        .map((i) => i.docNo),
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

  const openFilter = useCallback(async () => {
    const [datamenuService] = await Promise.all([
      menuService({ isApprover: false }),
    ]);

    const { data } = datamenuService;
    let dataAll = [{ key: "All", value: "All" }];
    let dataAPI = data
      .filter((v: any) => v.menuId === 1 || v.menuId === 2 || v.menuId === 3)
      .map((v: any) => ({
        value: v.Label,
        key: v.menuId,
      }));
    dataAll = [...dataAll, ...dataAPI];
    setSelectedIds([]);
    navigation.navigate("Filter", {
      filter,
      statusName: "สถานะเอกสาร",
      isTypeDoc: true,
      TypeDocOptions: dataAll,
      statusOptions: [
        { key: "All", value: "All" },
        { key: "Pending Approval", value: "Pending Approval" },
        { key: "Approved", value: "Approved" },
        { key: "Rejected", value: "Rejected" },
      ],
    });
  }, [filter, navigation]);

  const goToDetail = useCallback(
    (card: CardListModel) =>
      navigation.navigate("ApproveDetail", {
        docNo: card.docNo,
        menuId: card.menuId,
        status: card.status,
      }),
    [navigation]
  );

  const callAPIApproveDocuments = async (status: string) => {
    try {
      setIsload(true);
      await ApproveDocumentsService({ docNo: selectedIds.join("|"), status });
      setSelectedIds([]);
    } catch (err) {
    } finally {
      emitter.emit(getDataApprove);
      emitter.emit(filterDataDashboard);
      emitter.emit(filterDataMenu);
      setIsload(false);
    }
  };

  return (
    <Fragment>
      {/* Reject Modal */}
      <ModalComponent
        isOpen={isOpenReject}
        onChange={() => {
          {
            callAPIApproveDocuments("Rejected");
            setOpenReject(false);
          }
        }}
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
        onChange={() => {
          callAPIApproveDocuments("Approved");
          setOpenApprove(false);
        }}
        onBackdropPress={() => {
          setOpenApprove(false);
        }}
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
            onRetry={onRefresh}
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
                disabled={cardData.length === 0}
              >
                <Text style={styles.selectAllText}>
                  {allSelected ? "ยกเลิก" : "เลือกทั้งหมด"}
                </Text>
              </TouchableOpacity>

              {cardData.map((card) => (
                <ScanCard
                  key={card.id}
                  // ✅ ผูก ref ของแต่ละการ์ดให้เก็บไว้ใน uploadRefs.current[card.id]
                  ref={(h) => {
                    uploadRefs.current[card.docNo] = h;
                  }}
                  id={card.id}
                  hideAddFile={card.status !== "Open"}
                  keyRef1={card.docNo}
                  keyRef2={null}
                  keyRef3={null}
                  remark={null}
                  docNo={card.docNo}
                  date={card.date || ""}
                  status={card.status as StatusType}
                  hideSelectedIds={card.status !== "Pending Approval"}
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
                isload={isload}
              />
              <CustomButtons
                color={theme.green}
                label="อนุมัติรายการ"
                disabled={selectedIds.length === 0}
                onPress={() => setOpenApprove(true)}
                isload={isload}
              />
            </View>
          </>
        )}
      </View>
    </Fragment>
  );
}
