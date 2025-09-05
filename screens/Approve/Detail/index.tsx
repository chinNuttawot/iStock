import { emitter, filterApproveDetail, getDataApprove } from "@/common/emitter";
import CustomButtons from "@/components/CustomButtons";
import DetailCard from "@/components/DetailCard";
import Header from "@/components/Header";
import QuantitySerialModal from "@/components/Modals/QuantitySerialModal";
import EmptyState from "@/components/State/EmptyState";
import { ProductItem } from "@/dataModel/ScanIn/Detail";
import ModalComponent from "@/providers/Modal";
import { theme } from "@/providers/Theme";
import {
  ApproveDocumentsService,
  cardDetailIStockListService,
} from "@/service";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import { styles } from "./styles";

export type RouteParams = { docNo: string; menuId: number; status: string };

export default function ApproveDetailScreen() {
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
  const { docNo, menuId, status } = route.params as RouteParams;

  const scanInDetailForm = useForm();
  const [productData, setProductData] = useState<ProductItem[]>([]);
  const [isOpenViewReject, setIsOpenViewReject] = useState(false);
  const [isOpenViewApprove, setIsOpenViewApprove] = useState(false);

  const textGray = (theme as any).textGray ?? (theme as any).gray ?? "#9ca3af";

  useEffect(() => {
    const onFilterChanged = (data: any) => {
      console.log(`${filterApproveDetail} =====> `, data);
      setFilter(data);
    };
    emitter.on(filterApproveDetail, onFilterChanged);
    return () => {
      emitter.off(filterApproveDetail, onFilterChanged);
    };
  }, []);

  useEffect(() => {
    getDataDetail();
  }, []);

  const getDataDetail = async () => {
    try {
      const { data } = await cardDetailIStockListService({
        docNo,
        menuId,
      });
      setProductData(data);
    } catch (err) {
      // TODO: handle error state
    }
  };

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

  const onGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const visibleItems = useMemo(
    () => productData.filter((v) => !v.isDelete),
    [productData]
  );

  const RenderViewReject = (
    <View style={styles.mainView}>
      <Text
        style={[
          styles.label,
          { ...(theme as any).setFont_Bold },
          { textAlign: "center", padding: 8, fontSize: 20 },
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
  );

  const RenderViewApprove = (
    <View style={styles.mainView}>
      <Text
        style={[
          styles.label,
          { ...(theme as any).setFont_Bold },
          { textAlign: "center", padding: 8, fontSize: 20 },
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
  );

  const callAPIApproveDocuments = async (status: string) => {
    try {
      await ApproveDocumentsService({ docNo, status });
      navigation.goBack();
    } catch (err) {
    } finally {
      emitter.emit(getDataApprove);
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: theme.white }}>
      {/* Reject modal */}
      <ModalComponent
        isOpen={isOpenViewReject}
        onChange={() => {
          callAPIApproveDocuments("Rejected");
          setIsOpenViewReject(false);
        }}
        onBackdropPress={() => setIsOpenViewReject(false)}
        option={{ change: { label: "ตกลง", color: theme.mainApp } }}
      >
        {RenderViewReject}
      </ModalComponent>

      {/* Approve modal */}
      <ModalComponent
        isOpen={isOpenViewApprove}
        onChange={() => {
          callAPIApproveDocuments("Approved");
          setIsOpenViewApprove(false);
        }}
        onBackdropPress={() => setIsOpenViewApprove(false)}
        option={{ change: { label: "ตกลง", color: theme.mainApp } }}
      >
        {RenderViewApprove}
      </ModalComponent>

      <Header
        backgroundColor={theme.mainApp}
        colorIcon={theme.white}
        hideGoback={false}
        title={docNo}
        onGoBack={onGoBack}
        // IconComponent={[
        //   <TouchableOpacity key="filter" onPress={openFilter}>
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

      {productData.length === 0 && (
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

      {productData.length !== 0 && (
        <ScrollView contentContainerStyle={styles.content}>
          {visibleItems.map((item) => (
            <DetailCard
              key={item.id}
              data={item}
              viewMode
              isExpanded={expandedIds.includes(item.id)}
              onToggle={() => toggleExpand(item.id)}
            />
          ))}
        </ScrollView>
      )}

      {status === "Pending Approval" && (
        <View style={{ padding: 16, marginBottom: 16, flexDirection: "row" }}>
          <CustomButtons
            color={theme.red}
            label="ปฏิเสธ"
            onPress={() => setIsOpenViewReject(true)}
          />
          <CustomButtons
            color={theme.green}
            label="อนุมัติรายการ"
            onPress={() => setIsOpenViewApprove(true)}
          />
        </View>
      )}
    </View>
  );
}
