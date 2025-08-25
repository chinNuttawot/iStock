// components/UploadPicker.tsx
import { uploadMultiFetch } from "@/service"; // หรือ "@/service/apiCore/uploadService"
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";

type PickedItem = {
  id: string;
  uri: string;
  name: string;
  mime?: string;
  type: "image" | "file";
  size?: number;
  progress?: number; // 0..1
  status?: "queued" | "uploading" | "success" | "error";
  errorMsg?: string;
};

type Props = {
  /** URL ปลายทาง (ใช้สำหรับ derive baseUrl ให้ uploadMultiFetch และใช้กับ upload ทีละไฟล์) */
  fieldName?: string; // สำหรับโหมดทีละไฟล์
  extraHeaders?: Record<string, string>;
  allowsMultiple?: boolean;
  onAllUploaded?: (items: PickedItem[]) => void;
  insideScrollView?: boolean;
  /** ค่าเริ่มต้นของช่องข้อมูลที่แนบไปกับ multi */
  keyRef1?: any;
  keyRef2?: any;
  keyRef3?: any;
  remark?: any;
};

export default function UploadPicker({
  fieldName = "file",
  extraHeaders,
  allowsMultiple = true,
  onAllUploaded,
  insideScrollView = false,
  keyRef1 = null,
  keyRef2 = null,
  keyRef3 = null,
  remark = null,
}: Props) {
  const [items, setItems] = useState<PickedItem[]>([]);
  const uploadingRef = useRef(false);

  const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // 20MB

  // ===== utilities =====
  const deriveBaseUrl = useCallback((full: string) => {
    try {
      const u = new URL(full);
      return `${u.protocol}//${u.host}`; // origin
    } catch {
      // fallback: ตัดท้าย '/api/upload/multi' ถ้ามี
      return full.replace(/\/api\/upload\/multi.*$/i, "");
    }
  }, []);

  const toStr = (v: unknown) =>
    v === null || v === undefined ? "" : typeof v === "string" ? v : String(v);

  // ---------- permissions ----------
  const requestImagePermission = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("ต้องการสิทธิ์เข้าถึงรูปภาพ", "โปรดอนุญาตใน Settings");
      return false;
    }
    return true;
  }, []);

  const requestCameraPermission = useCallback(async () => {
    const cam = await ImagePicker.requestCameraPermissionsAsync();
    if (cam.status !== "granted") {
      Alert.alert("ต้องการสิทธิ์กล้อง", "โปรดอนุญาตใน Settings");
      return false;
    }
    return true;
  }, []);

  // ---------- helpers ----------
  const getFileSize = useCallback(async (uri: string) => {
    const info = await FileSystem.getInfoAsync(uri, { size: true });
    return Number(info.size || 0);
  }, []);

  // แปลง content:// ให้เป็น file:// โดย copy ไป cache
  const ensureFileUriForFormData = useCallback(
    async (uri: string, name: string): Promise<string> => {
      if (uri.startsWith("file://")) return uri;
      const dest = `${FileSystem.cacheDirectory}${name || "tmp"}`;
      try {
        await FileSystem.copyAsync({ from: uri, to: dest });
        return dest;
      } catch {
        return uri;
      }
    },
    []
  );

  // ย่อ/บีบอัดรูปให้ <= 20MB
  const downsizeToLimit = useCallback(
    async (uri: string, name: string, maxBytes = MAX_IMAGE_BYTES) => {
      let currentUri = uri;

      // ขั้น 0: แปลงเป็น JPEG 0.9
      try {
        const first = await ImageManipulator.manipulateAsync(currentUri, [], {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
        });
        currentUri = first.uri;
      } catch {}

      const trySize = async () => await getFileSize(currentUri);

      // ขั้น 1: ลดคุณภาพ
      const qualities = [0.85, 0.75, 0.65, 0.55, 0.45, 0.35, 0.25];
      for (const q of qualities) {
        if ((await trySize()) <= maxBytes) break;
        const r = await ImageManipulator.manipulateAsync(currentUri, [], {
          compress: q,
          format: ImageManipulator.SaveFormat.JPEG,
        });
        currentUri = r.uri;
      }

      // ขั้น 2: ลดความกว้าง
      if ((await trySize()) > maxBytes) {
        const widths = [3000, 2400, 2000, 1600, 1280, 1024];
        for (const w of widths) {
          const r = await ImageManipulator.manipulateAsync(
            currentUri,
            [{ resize: { width: w } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );
          currentUri = r.uri;
          if ((await trySize()) <= maxBytes) break;
        }
      }

      const finalName =
        name.replace(/\.(png|jpg|jpeg|heic|webp)$/i, "") + ".jpg";
      return {
        uri: currentUri,
        name: finalName,
        type: "image/jpeg",
        size: await getFileSize(currentUri),
      };
    },
    [MAX_IMAGE_BYTES, getFileSize]
  );

  // ---------- pickers ----------
  const addItem = useCallback(
    (item: PickedItem) => {
      setItems((prev) => (allowsMultiple ? [...prev, item] : [item]));
    },
    [allowsMultiple]
  );

  const pickImages = useCallback(async () => {
    const ok = await requestImagePermission();
    if (!ok) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: allowsMultiple,
      quality: 0.9,
      selectionLimit: allowsMultiple ? 0 : 1,
    });
    if (res.canceled) return;

    (res.assets ?? []).forEach((a, idx) => {
      addItem({
        id: `${Date.now()}_${idx}`,
        uri: a.uri,
        name: a.fileName || a.uri.split("/").pop() || `image_${idx}.jpg`,
        mime: a.mimeType || "image/jpeg",
        size: a.fileSize,
        type: "image",
        status: "queued",
        progress: 0,
      });
    });
  }, [addItem, allowsMultiple, requestImagePermission]);

  const takePhoto = useCallback(async () => {
    const ok = await requestCameraPermission();
    if (!ok) return;

    const res = await ImagePicker.launchCameraAsync({
      quality: 0.9,
      allowsEditing: false,
    });
    if (res.canceled) return;

    const a = res.assets?.[0];
    if (!a) return;

    addItem({
      id: `${Date.now()}`,
      uri: a.uri,
      name: a.fileName || a.uri.split("/").pop() || `photo.jpg`,
      mime: a.mimeType || "image/jpeg",
      size: a.fileSize,
      type: "image",
      status: "queued",
      progress: 0,
    });
  }, [addItem, requestCameraPermission]);

  const pickDocuments = useCallback(async () => {
    const res = await DocumentPicker.getDocumentAsync({
      multiple: allowsMultiple,
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;
    (res.assets ?? []).forEach((f, idx) => {
      addItem({
        id: `${Date.now()}_${idx}`,
        uri: f.uri,
        name: f.name,
        mime: f.mimeType ?? "application/octet-stream",
        size: f.size,
        type: "file",
        status: "queued",
        progress: 0,
      });
    });
  }, [addItem, allowsMultiple]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  // ---------- upload: รวม (multi via uploadMultiFetch) ----------
  const uploadAllInOneRequest = useCallback(async () => {
    const queued = items.filter((x) => x.status === "queued" || !x.status);
    if (queued.length === 0) {
      Alert.alert("ไม่มีไฟล์ในคิว");
      return;
    }

    try {
      // เตรียม parts (ensure file:// + ย่อภาพ ≤20MB)
      const parts = await Promise.all(
        queued.map(async (f) => {
          let safeUri = await ensureFileUriForFormData(f.uri, f.name);
          let name = f.name;
          let type =
            f.mime ||
            (f.type === "image" ? "image/jpeg" : "application/octet-stream");

          if (f.type === "image") {
            const downsized = await downsizeToLimit(
              safeUri,
              name,
              MAX_IMAGE_BYTES
            );
            safeUri = downsized.uri;
            name = downsized.name;
            type = downsized.type;
          }

          return { uri: safeUri, name, type };
        })
      );

      await uploadMultiFetch(parts, toStr(keyRef1), keyRef2, keyRef3, remark);

      // อัปเดตสถานะ success ทั้งชุด
      setItems((prev) =>
        prev.map((p) =>
          queued.some((q) => q.id === p.id)
            ? { ...p, status: "success", progress: 1 }
            : p
        )
      );
      onAllUploaded?.(
        queued.map((x) => ({ ...x, status: "success", progress: 1 }))
      );
      Alert.alert("สำเร็จ", `อัปโหลดไฟล์ ${queued.length} รายการ`);
    } catch (e: any) {
      setItems((prev) =>
        prev.map((p) =>
          queued.some((q) => q.id === p.id)
            ? { ...p, status: "error", errorMsg: String(e?.message || e) }
            : p
        )
      );
      Alert.alert("ผิดพลาด", String(e?.message || e));
    }
  }, [
    items,
    keyRef1,
    keyRef2,
    keyRef3,
    remark,
    onAllUploaded,
    ensureFileUriForFormData,
    downsizeToLimit,
    deriveBaseUrl,
  ]);

  // ---------- UI ----------
  const successCount = useMemo(
    () => items.filter((x) => x.status === "success").length,
    [items]
  );

  const renderItem = ({ item }: { item: PickedItem }) => {
    return (
      <View style={styles.card}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {item.type === "image" ? (
            <Image
              source={{ uri: item.uri }}
              style={{ width: 64, height: 64, borderRadius: 8 }}
            />
          ) : (
            <View style={styles.fileIcon}>
              <Text style={{ fontWeight: "700" }}>FILE</Text>
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={styles.name}>
              {item.name}
            </Text>
            <Text style={styles.meta}>
              {item.mime || "unknown"}{" "}
              {item.size ? `• ${(item.size / 1024).toFixed(1)} KB` : ""}
            </Text>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round((item.progress ?? 0) * 100)}%` },
                ]}
              />
            </View>

            <Text style={styles.statusText}>
              {item.status ?? "queued"}{" "}
              {typeof item.progress === "number"
                ? `(${Math.round((item.progress ?? 0) * 100)}%)`
                : ""}
              {item.status === "error" && item.errorMsg
                ? ` • ${item.errorMsg}`
                : ""}
            </Text>
          </View>

          <Pressable
            onPress={() => removeItem(item.id)}
            style={styles.removeBtn}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>×</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Controls */}
      <View style={styles.row}>
        <Pressable style={styles.btn} onPress={pickImages}>
          <Text style={styles.btnText}>เลือกจากคลังรูป</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={takePhoto}>
          <Text style={styles.btnText}>ถ่ายรูป</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={pickDocuments}>
          <Text style={styles.btnText}>เลือกไฟล์</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ gap: 10 }}
        renderItem={renderItem}
        scrollEnabled={!insideScrollView}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#777" }}>
            ยังไม่มีไฟล์ในคิว
          </Text>
        }
      />

      <View style={[styles.row, { marginTop: 8 }]}>
        <Pressable
          style={[styles.btn, { backgroundColor: "#6366f1" }]}
          onPress={uploadAllInOneRequest}
        >
          <Text style={styles.btnText}>อัปโหลดรวม (multi like Postman)</Text>
        </Pressable>
        <Text style={{ marginLeft: 8, color: "#333" }}>
          สำเร็จ: {successCount}/{items.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  btn: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  uploadBtn: { backgroundColor: "#16a34a" },
  btnText: { color: "#fff", fontWeight: "700" },

  card: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#f6f8fa",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
  },
  name: { fontWeight: "700", marginBottom: 2, maxWidth: 220 },
  meta: { fontSize: 12, color: "#666", marginBottom: 6 },
  fileIcon: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#0ea5e9" },
  statusText: { fontSize: 12, marginTop: 4, color: "#374151" },

  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  label: { width: 70, fontWeight: "700" },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 160,
  },
});
