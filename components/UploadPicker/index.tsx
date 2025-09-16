// components/UploadPicker.tsx
import {
  emitter,
  getDataScanIn,
  getDataScanOut,
  getDataStockCheck,
  getDataTransfer,
} from "@/common/emitter";
import { filenameFromUri } from "@/helpers/filename";
import { theme } from "@/providers/Theme";
import {
  deleteFileService,
  fileService,
  Profile,
  uploadMultiFetch,
} from "@/service"; // หรือ "@/service/apiCore/uploadService"
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

// ====== (optional) ใช้ WebView ถ้ามีติดตั้งแพ็กเกจ react-native-webview ======
let WebViewComp: any = null;
try {
  WebViewComp = require("react-native-webview").WebView;
} catch {}

// ====== helpers สำหรับการพรีวิว / อัปโหลด ======
const isRemoteHttp = (uri?: string) => !!uri && /^https?:\/\//i.test(uri || "");

// ใช้สำหรับ "ดูไฟล์": ถ้าเป็น http/https ส่งกลับเลย, ถ้าเป็น content:// ให้ copy ไป cache -> file://
const ensurePreviewableUri = async (uri: string, name: string) => {
  if (isRemoteHttp(uri)) return uri;
  if (uri.startsWith("file://")) return uri;
  const baseName = name || "tmp";
  const dest =
    (FileSystem.cacheDirectory || "") +
    (/\.[a-z0-9]+$/i.test(baseName) ? baseName : baseName + ".bin");
  try {
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  } catch {
    return uri;
  }
};

export type PickedItem = {
  id: string;
  uri: string;
  name: string;
  mime?: string;
  type: "image" | "file";
  size?: number;
  progress?: number; // 0..1
  isDelete?: boolean;
  status?: "queued" | "uploading" | "success" | "error";
  errorMsg?: string;
};

export type UploadPickerHandle = {
  /** เรียกอัปโหลดไฟล์ทั้งหมดที่อยู่ในคิว (โหมด multi) */
  uploadAllInOneRequests: () => Promise<void>;
};

type Props = {
  fieldName?: string;
  extraHeaders?: Record<string, string>;
  allowsMultiple?: boolean;
  onAllUploaded?: (items: PickedItem[]) => void;
  insideScrollView?: boolean;
  hideAddFile: boolean;
  keyRef1?: any;
  keyRef2?: any;
  keyRef3?: any;
  remark?: any;
};

function UploadPicker(props: Props, ref: React.Ref<UploadPickerHandle>) {
  const {
    fieldName = "file",
    extraHeaders,
    allowsMultiple = true,
    onAllUploaded,
    insideScrollView = false,
    keyRef1 = null,
    keyRef2 = null,
    keyRef3 = null,
    remark = null,
    hideAddFile = false,
  }: Props = props;

  // ====== HARD CAP ======
  const MAX_ITEMS = 10;
  const [items, setItems] = useState<PickedItem[]>([]);
  const { width: _SCREEN_W, height: _SCREEN_H } = useWindowDimensions();

  // --- clamp helper: หั่น array ไม่เกิน MAX ทุกครั้ง ---
  const alertLockRef = useRef(false);
  const clampItems = useCallback(
    (arr: PickedItem[], opts?: { showAlert?: boolean }) => {
      const showAlert = opts?.showAlert ?? false;
      if (arr.length <= MAX_ITEMS) return arr;
      if (showAlert && !alertLockRef.current) {
        alertLockRef.current = true;
        Alert.alert(
          "มีไฟล์เกินจำนวนที่กำหนด",
          `เพิ่มได้สูงสุด ${MAX_ITEMS} รายการ`
        );
        setTimeout(() => (alertLockRef.current = false), 800);
      }
      return arr.slice(0, MAX_ITEMS);
    },
    []
  );

  const remainingSlots = useMemo(
    () => Math.max(0, MAX_ITEMS - items.length),
    [items.length]
  );
  const isFull = remainingSlots <= 0;

  // ====== Global invariant: ถ้ามีกรณีไหนทะลุมา จะโดนหั่นตรงนี้อีกรอบแบบเงียบ ๆ ======
  useEffect(() => {
    setItems((prev) =>
      prev.length > MAX_ITEMS ? prev.slice(0, MAX_ITEMS) : prev
    );
  }, [items.length]);

  // ====== preview รูปภาพ (ทีละรูป) ======
  const imageItems = useMemo(
    () => items.filter((x) => x.type === "image"),
    [items]
  );
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // ถ้าจำนวนรูปเปลี่ยนตอน modal เปิดอยู่ ให้คลัมป์ index ให้ถูกช่วงเสมอ
  useEffect(() => {
    if (!previewVisible) return;
    setPreviewIndex((i) => {
      const max = imageItems.length - 1;
      return max >= 0 ? Math.min(Math.max(0, i), max) : 0;
    });
  }, [imageItems.length, previewVisible]);

  const currentImage = imageItems[previewIndex];

  const guessMimeFromName = (name?: string) => {
    if (!name) return "application/octet-stream";
    const n = name.toLowerCase();
    if (/\.(jpg|jpeg)$/.test(n)) return "image/jpeg";
    if (/\.png$/.test(n)) return "image/png";
    if (/\.webp$/.test(n)) return "image/webp";
    if (/\.pdf$/.test(n)) return "application/pdf";
    return "application/octet-stream";
  };

  useEffect(() => {
    getFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyRef1, keyRef2, keyRef3, remark]);

  const getFile = async () => {
    try {
      const param = { keyRef1, keyRef2, keyRef3, remark };
      const { data } = await fileService(param);
      const profile = await Profile();
      const fromServer: PickedItem[] = (Array.isArray(data) ? data : []).map(
        (a: any, idx: number) => {
          const url: string = a.url || a.uri || "";
          const filename: string =
            a.filename || a.fileName || url.split("/").pop() || `file_${idx}`;
          const mime: string =
            a.mime || a.mimeType || guessMimeFromName(filename);
          const isImage =
            mime.startsWith("image/") ||
            /\.(jpg|jpeg|png|webp)$/i.test(filename) ||
            /\.(jpg|jpeg|png|webp)$/i.test(url);

          return {
            id: String(a.id ?? `srv_${idx}`),
            uri: url,
            name: filename,
            mime,
            size: a.size || a.fileSize,
            type: isImage ? "image" : "file",
            status: "success",
            progress: 1,
            isDelete: !profile.isApprover, // ไฟล์จากเซิร์ฟเวอร์ อนุญาตลบ
          } as PickedItem;
        }
      );

      const clamped = clampItems(fromServer, {
        showAlert: fromServer.length > MAX_ITEMS,
      });
      setItems(clamped);
    } catch (e) {
      console.log("getFile error:", e);
    }
  };

  const openPreviewById = useCallback(
    (id: string) => {
      const idx = imageItems.findIndex((x) => x.id === id);
      if (idx >= 0) {
        setPreviewIndex(idx);
        setPreviewVisible(true);
      }
    },
    [imageItems]
  );

  const closePreview = useCallback(() => {
    setPreviewVisible(false);
  }, []);

  const onDelete = useCallback(async (params: any) => {
    try {
      await deleteFileService(params);
      setPreviewVisible(false);
      setPdfVisible(false);
      emitter.emit(getDataScanOut);
      emitter.emit(getDataScanIn);
      emitter.emit(getDataStockCheck);
      emitter.emit(getDataTransfer);
    } catch (err) {
      Alert.alert("เกิดข้อผิดพลาด", "ลองใหม่อีกครั้ง");
    }
  }, []);

  const goPrev = useCallback(() => {
    setPreviewIndex((i) => Math.max(0, i - 1));
  }, []);
  const goNext = useCallback(() => {
    setPreviewIndex((i) => Math.min(imageItems.length - 1, i + 1));
  }, [imageItems.length]);

  // ====== preview PDF ======
  const [pdfVisible, setPdfVisible] = useState(false);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [isDeletePDF, setIsDeletePDF] = useState<boolean>(false);
  const [pdfName, setPdfName] = useState<string>("");

  const openPdf = useCallback(async (fileItem: PickedItem) => {
    try {
      const safe = await ensurePreviewableUri(fileItem.uri, fileItem.name);
      setPdfUri(safe);
      setPdfName(fileItem.name);
      setPdfVisible(true);
      setIsDeletePDF(fileItem?.isDelete ?? false);
    } catch {
      try {
        await Linking.openURL(fileItem.uri);
      } catch {
        Alert.alert("เปิดไฟล์ไม่ได้", "ไม่สามารถเปิดไฟล์ PDF ได้");
      }
    }
  }, []);

  const closePdf = useCallback(() => {
    setPdfVisible(false);
    setPdfUri(null);
    setPdfName("");
  }, []);

  const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // 20MB

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
    const info = await FileSystem.getInfoAsync(uri, { size: true } as any);
    return Number((info as any).size || 0);
  }, []);

  // ใช้สำหรับ "อัปโหลด": ไม่แปลง http/https (ให้เป็น URL ไปตามเดิม)
  const ensureFileUriForFormData = useCallback(
    async (uri: string, name: string): Promise<string> => {
      if (isRemoteHttp(uri)) return uri; // ถ้าเป็น URL ระยะไกล ให้คงไว้
      if (uri.startsWith("file://")) return uri;
      const baseName = name || "tmp";
      const dest =
        (FileSystem.cacheDirectory || "") +
        (/\.[a-z0-9]+$/i.test(baseName) ? baseName : baseName + ".bin");
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
      try {
        const first = await ImageManipulator.manipulateAsync(currentUri, [], {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
        });
        currentUri = first.uri;
      } catch {}
      const trySize = async () => await getFileSize(currentUri);
      const qualities = [0.85, 0.75, 0.65, 0.55, 0.45, 0.35, 0.25];
      for (const q of qualities) {
        if ((await trySize()) <= maxBytes) break;
        const r = await ImageManipulator.manipulateAsync(currentUri, [], {
          compress: q,
          format: ImageManipulator.SaveFormat.JPEG,
        });
        currentUri = r.uri;
      }
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

  // ---------- add helpers (จำกัดจำนวนรวม) ----------
  const addItems = useCallback(
    (newItems: PickedItem[]) => {
      setItems((prev) =>
        clampItems([...prev, ...newItems], { showAlert: true })
      );
    },
    [clampItems]
  );

  const addItem = useCallback(
    (item: PickedItem) => addItems([item]),
    [addItems]
  );

  // ---------- pickers ----------
  const pickImages = useCallback(async () => {
    if (isFull) {
      Alert.alert("จำนวนไฟล์เต็ม", `เพิ่มได้สูงสุด ${MAX_ITEMS} รายการ`);
      return;
    }
    const ok = await requestImagePermission();
    if (!ok) return;

    const selectionLimit = allowsMultiple ? Math.max(1, remainingSlots) : 1;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: allowsMultiple,
      quality: 0.9,
      selectionLimit, // อาจถูกเมินบนบางแพลตฟอร์ม → เรามี clamp ซ้ำชั้นล่าง
    });
    if (res.canceled) return;

    const picked: PickedItem[] = (res.assets ?? []).map((a, idx) => ({
      id: `${Date.now()}_${idx}`,
      uri: a.uri,
      name: a.fileName || a.uri.split("/").pop() || `image_${idx}.jpg`,
      mime: a.mimeType || "image/jpeg",
      size: a.fileSize,
      type: "image",
      status: "queued",
      progress: 0,
      isDelete: false, // ไฟล์ใหม่จากเครื่อง ยังไม่ลบบนเซิร์ฟเวอร์
    }));

    addItems(picked);
  }, [
    allowsMultiple,
    requestImagePermission,
    addItems,
    isFull,
    remainingSlots,
  ]);

  const takePhoto = useCallback(async () => {
    if (isFull) {
      Alert.alert("จำนวนไฟล์เต็ม", `เพิ่มได้สูงสุด ${MAX_ITEMS} รายการ`);
      return;
    }
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
      isDelete: false,
    });
  }, [addItem, requestCameraPermission, isFull]);

  const pickDocuments = useCallback(async () => {
    if (isFull) {
      Alert.alert("จำนวนไฟล์เต็ม", `เพิ่มได้สูงสุด ${MAX_ITEMS} รายการ`);
      return;
    }
    const res = await DocumentPicker.getDocumentAsync({
      multiple: allowsMultiple,
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;

    const picked: PickedItem[] = (res.assets ?? []).map((f, idx) => ({
      id: `${Date.now()}_${idx}`,
      uri: f.uri,
      name: f.name,
      mime: f.mimeType ?? "application/octet-stream",
      size: f.size,
      type: "file",
      status: "queued",
      progress: 0,
      isDelete: false,
    }));

    addItems(picked);
  }, [addItems, allowsMultiple, isFull]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  // ---------- upload: รวม (multi via uploadMultiFetch) ----------
  const uploadAllInOneRequest = useCallback(async () => {
    const queued = items.filter((x) => x.status === "queued" || !x.status);
    if (queued.length === 0) return;

    try {
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
      const createdBy = (await Profile()).userName;
      await uploadMultiFetch(
        parts,
        toStr(keyRef1),
        keyRef2,
        keyRef3,
        remark,
        createdBy
      );
    } catch (e: any) {
      setItems((prev) =>
        prev.map((p) =>
          queued.some((q) => q.id === p.id)
            ? { ...p, status: "error", errorMsg: String(e?.message || e) }
            : p
        )
      );
    } finally {
      setItems([]);
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
  ]);

  // ---------- imperative handle ----------
  useImperativeHandle(
    ref,
    () => ({
      uploadAllInOneRequests: () => uploadAllInOneRequest(),
    }),
    [uploadAllInOneRequest]
  );

  // ---------- UI ----------
  const renderItem = ({ item }: { item: PickedItem }) => {
    const isImage = item.type === "image";
    const isPdf =
      (item.mime && item.mime.includes("pdf")) ||
      /\.pdf$/i.test(item.name || "");

    return (
      <View style={styles.card}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {isImage ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openPreviewById(item.id)}
            >
              <Image
                source={{ uri: item.uri }}
                style={{ width: 64, height: 64, borderRadius: 8 }}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (isPdf) {
                  openPdf(item);
                } else {
                  Linking.openURL(item.uri).catch(() =>
                    Alert.alert("เปิดไฟล์ไม่ได้", "ไม่รองรับการแสดงไฟล์นี้")
                  );
                }
              }}
            >
              <View style={styles.fileIcon}>
                <Text style={{ fontWeight: "700" }}>
                  {isPdf ? "PDF" : "FILE"}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text numberOfLines={1} style={styles.name}>
              {item.name}
            </Text>
            <Text style={styles.meta}>
              {item.mime || "unknown"}{" "}
              {item.size ? `• ${(item.size / 1024).toFixed(1)} KB` : ""}
            </Text>
          </View>

          {item.status !== "success" && (
            <Pressable
              onPress={() => removeItem(item.id)}
              style={styles.removeBtn}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>×</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Controls */}
      {!hideAddFile && (
        <View style={[styles.row, isFull && { opacity: 0.6 }]}>
          <TouchableOpacity
            style={[styles.btn, isFull && { backgroundColor: "#9ca3af" }]}
            onPress={pickImages}
            disabled={isFull}
          >
            <Text style={styles.btnText}>เลือกจากคลังรูป</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, isFull && { backgroundColor: "#9ca3af" }]}
            onPress={takePhoto}
            disabled={isFull}
          >
            <Text style={styles.btnText}>ถ่ายรูป</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, isFull && { backgroundColor: "#9ca3af" }]}
            onPress={pickDocuments}
            disabled={isFull}
          >
            <Text style={styles.btnText}>เลือกไฟล์</Text>
          </TouchableOpacity>

          {/* ตัวนับจำนวน */}
          <View style={styles.counterPill}>
            <Text style={styles.counterText}>
              {items.length}/{MAX_ITEMS}
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(it, idx) => `${it.id}_${idx}`} // กันคีย์ชนหลังโดน slice
        contentContainerStyle={{ gap: 10 }}
        renderItem={renderItem}
        scrollEnabled={!insideScrollView}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#777" }}></Text>
        }
      />

      {/* ====== Image Preview Modal (ทีละรูป) ====== */}
      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={closePreview}
      >
        <View style={styles.previewBackdrop}>
          <View style={styles.previewContent}>
            <View style={styles.previewHeader}>
              <View style={styles.Row}>
                {currentImage?.isDelete && (
                  <TouchableOpacity
                    style={styles.del}
                    onPress={() => {
                      const name = filenameFromUri(currentImage?.uri ?? "");
                      onDelete({ name });
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Delete image"
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={closePreview}
                  style={styles.previewClose}
                >
                  <Text
                    style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}
                  >
                    X
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.singleImageWrap}>
              {currentImage ? (
                <Image
                  source={{ uri: currentImage.uri }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="contain"
                />
              ) : null}
            </View>

            {imageItems.length > 1 && (
              <>
                <TouchableOpacity
                  onPress={goPrev}
                  disabled={previewIndex === 0}
                  style={[
                    styles.navBtn,
                    styles.navLeft,
                    previewIndex === 0 && styles.navBtnDisabled,
                  ]}
                >
                  <Text style={styles.navBtnText}>‹</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={goNext}
                  disabled={previewIndex >= imageItems.length - 1}
                  style={[
                    styles.navBtn,
                    styles.navRight,
                    previewIndex >= imageItems.length - 1 &&
                      styles.navBtnDisabled,
                  ]}
                >
                  <Text style={styles.navBtnText}>›</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ====== PDF Preview Modal ====== */}
      <Modal
        visible={pdfVisible}
        transparent
        animationType="fade"
        onRequestClose={closePdf}
      >
        <View style={styles.previewBackdrop}>
          <View style={styles.previewContent}>
            <View style={styles.previewHeader}>
              <View style={styles.Row}>
                {isDeletePDF && (
                  <TouchableOpacity
                    style={styles.del}
                    onPress={() => {
                      const name = filenameFromUri(pdfUri ?? "");
                      onDelete({ name });
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Delete image"
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={closePdf}
                  style={styles.previewClose}
                >
                  <Text
                    style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flex: 1 }}>
              {WebViewComp && pdfUri ? (
                Platform.OS === "android" && isRemoteHttp(pdfUri) ? (
                  <View
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 24,
                    }}
                  >
                    <Text
                      style={{
                        ...theme.setFont,
                        color: "#fff",
                        textAlign: "center",
                        marginBottom: 12,
                      }}
                    >
                      จะเปิดภายนอกแทน
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        Linking.openURL(pdfUri!).catch(() =>
                          Alert.alert(
                            "เปิดไฟล์ไม่ได้",
                            "ไม่สามารถเปิดด้วยแอปภายนอก"
                          )
                        )
                      }
                      style={[{ backgroundColor: "rgba(255,255,255,0.15)" }]}
                    >
                      <Text style={{ ...theme.setFont, color: "#fff" }}>
                        เปิดภายนอก
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <WebViewComp
                    source={
                      isRemoteHttp(pdfUri)
                        ? { uri: pdfUri }
                        : Platform.OS === "android"
                        ? { uri: `file://${pdfUri.replace(/^file:\/\//, "")}` }
                        : { uri: pdfUri }
                    }
                    style={{ flex: 1 }}
                    originWhitelist={["*"]}
                    allowFileAccess
                    allowUniversalAccessFromFileURLs
                    mixedContentMode="always"
                  />
                )
              ) : pdfUri ? (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      textAlign: "center",
                      marginBottom: 12,
                    }}
                  >
                    โปรเจกต์ยังไม่ได้ติดตั้ง react-native-webview{"\n"}
                    จะเปิดภายนอกแทน
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(pdfUri!).catch(() =>
                        Alert.alert(
                          "เปิดไฟล์ไม่ได้",
                          "ไม่สามารถเปิดด้วยแอปภายนอก"
                        )
                      )
                    }
                    style={[
                      styles.previewClose,
                      { backgroundColor: "rgba(255,255,255,0.15)" },
                    ]}
                  >
                    <Text style={{ color: "#fff" }}>เปิดภายนอก</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#fff" }}>ไม่มีไฟล์ PDF</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  Row: { flexDirection: "row", flex: 1, justifyContent: "flex-end" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  btn: {
    backgroundColor: theme.mainApp,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  uploadBtn: { backgroundColor: "#16a34a" },

  btnText: { color: "#fff", fontWeight: "700", ...theme.setFont, fontSize: 12 },

  // counter pill
  counterPill: {
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  counterText: { fontWeight: "700", color: "#111827" },

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

  // preview styles
  previewBackdrop: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  previewContent: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 32,
  },
  previewHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 24,
    height: 56 + 24,
  },
  previewCounter: {
    ...theme.setFont,
    width: 300,
    color: "#fff",
  },
  previewClose: {
    width: 45,
    height: 45,
    borderRadius: 100,
    backgroundColor: "rgba(255, 0, 0, 1)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  del: {
    marginRight: 50,
    width: 45,
    height: 45,
    borderRadius: 100,
    backgroundColor: "rgba(255, 191, 0, 1)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  // single image + nav
  singleImageWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 56 + 24,
    marginBottom: 16,
  },
  navBtn: {
    position: "absolute",
    top: "50%",
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.21)",
    alignItems: "center",
    justifyContent: "center",
  },
  navLeft: { left: 12 },
  navRight: { right: 12 },
  navBtnText: { color: "#fff", fontSize: 28, fontWeight: "700" },
  navBtnDisabled: { opacity: 0.4 },

  previewName: {
    color: "#ddd",
    fontSize: 12,
    textAlign: "center",
  },
});

export default forwardRef<UploadPickerHandle, Props>(UploadPicker);
