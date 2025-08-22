// components/modals/QuantitySerialModal.tsx
import CustomButton from "@/components/CustomButton";
import ModalComponent from "@/providers/Modal";
import { theme } from "@/providers/Theme";
import { keyboardTypeNumber } from "@/screens/Register/register";
import React, { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";

type ItemKey = {
  docNo: string;
  model: string;
  receivedQty: number;
  totalQty: number;
};
type Props = {
  isOpen: boolean;
  item: ItemKey | null;
  onClose: () => void;
  form: any; // useForm() instance
  labelConfirm?: string;
};

export default function QuantitySerialModal({
  isOpen,
  item,
  onClose,
  form,
  labelConfirm = "ยืนยัน",
}: Props) {
  const [qty, setQty] = useState("");
  const [serialNo, setSerialNo] = useState("");

  const maxCanAdd = Math.max(
    0,
    (item?.totalQty ?? 0) - (item?.receivedQty ?? 0)
  );
  const qtyKey = item
    ? `newReceivedQty-docNo-${item.docNo}-model-${item.model}`
    : "";
  const serialKey = item
    ? `serialNo-docNo-${item.docNo}-model-${item.model}`
    : "";

  useEffect(() => {
    if (!item) return;
    setQty(form.getValues(qtyKey) ?? "");
    setSerialNo(form.getValues(serialKey) ?? "");
  }, [item?.docNo, item?.model]);

  return (
    <ModalComponent
      isOpen={isOpen}
      onBackdropPress={onClose}
      hideCustomButtons
      option={{ change: { label: labelConfirm, color: theme.mainApp } }}
      onChange={() => {}}
    >
      <View style={{ width: "100%" }}>
        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: theme.text, marginBottom: 6 }}>
            {`จำนวนที่เพิ่มได้ไม่เกิน `}
            <Text style={{ fontWeight: "700" }}>{maxCanAdd}</Text>
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 10,
              paddingHorizontal: 12,
            }}
          >
            <TextInput
              value={qty}
              keyboardType={keyboardTypeNumber}
              onChangeText={(text) => {
                const num = Number(text);
                if (
                  text === "" ||
                  (!Number.isNaN(num) && num <= maxCanAdd && num >= 0)
                ) {
                  setQty(text);
                }
              }}
              style={{ height: 42 }}
            />
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: theme.text, marginBottom: 6 }}>Serial No</Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 10,
              paddingHorizontal: 12,
            }}
          >
            <TextInput
              value={serialNo}
              onChangeText={setSerialNo}
              style={{ height: 42 }}
            />
          </View>
        </View>

        <View style={{ paddingHorizontal: 64 }}>
          <CustomButton
            label="บันทึก"
            onPress={() => {
              if (!item) return;
              form.setValue(qtyKey, qty);
              form.setValue(serialKey, serialNo);
              onClose();
            }}
          />
        </View>
      </View>
    </ModalComponent>
  );
}
