import { Assets } from "@/assets/Assets";
import { useAuth } from "@/AuthContext";
import CustomButton from "@/components/CustomButton";
import {
  authToken,
  rememberMeKey,
  savedPasswordKey,
  savedUsernameKey,
} from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import { theme } from "@/providers/Theme";
import { loginService, Profile } from "@/service";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Buffer } from "buffer";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// (option) polyfill เผื่อบาง env ไม่มี Buffer
// @ts-ignore
global.Buffer = global.Buffer || Buffer;

// เก็บรหัสผ่านใน SecureStore (Keychain/Keystore)

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [isload, setIsload] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [hasUser, setHasUser] = useState(false);
  const [hasPass, setHasPass] = useState(false);

  // ป้องกัน auto-login ซ้ำ
  const autoLoginTried = useRef(false);

  const navigation = useNavigation<any>();
  const { login, logout } = useAuth();

  // ----- handleLogin (stable ด้วย useCallback) -----
  const handleLogin = useCallback(async () => {
    // ถ้ากำลังโหลดอยู่ หรือ เคย auto-login ไปแล้ว (กรณี auto) ก็ return กันซ้ำ
    if (isload) return;

    const base64Encoded = Buffer.from(password, "utf8").toString("base64");

    try {
      setIsload(true);

      const { data } = await loginService({
        username,
        password: base64Encoded,
      });

      // เก็บ token ตามเดิม
      await StorageUtility.set(authToken, data.token);

      // Remember me: เก็บ username ใน StorageUtility และ "password" ใน SecureStore
      if (rememberMe) {
        await StorageUtility.set(rememberMeKey, "true");
        await StorageUtility.set(savedUsernameKey, username);
        await SecureStore.setItemAsync(savedPasswordKey, password, {
          accessible: SecureStore.AFTER_FIRST_UNLOCK,
        });
      } else {
        await StorageUtility.set(rememberMeKey, "false");
        await StorageUtility.remove(savedUsernameKey);
        await SecureStore.deleteItemAsync(savedPasswordKey);
      }
      await Profile();
      login();
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", "ลองใหม่อีกครั้ง");
    } finally {
      setIsload(false);
    }
  }, [isload, login, password, rememberMe, username, logout]);

  // ----- Auto-login เมื่อมีทั้ง user+pass ที่จำไว้ -----
  useEffect(() => {
    if (hasUser && hasPass && !autoLoginTried.current) {
      autoLoginTried.current = true; // ทำครั้งเดียว
      handleLogin();
    }
  }, [hasUser, hasPass, handleLogin]);

  // ----- โหลดค่า remember / username / password ตอนเปิดจอ -----
  useEffect(() => {
    bootstrap();
  }, []);

  const bootstrap = async () => {
    // โหลดสถานะ remember me + เติม username/password อัตโนมัติ
    const savedRemember = await StorageUtility.get(rememberMeKey);
    const savedUser = await StorageUtility.get(savedUsernameKey);

    if (savedRemember === "true") {
      setRememberMe(true);
      if (savedUser) {
        setUsername(savedUser);
        setHasUser(true);
      }

      // ดึงรหัสผ่านจาก SecureStore (จะคืน null ถ้าไม่มี)
      const savedPass = await SecureStore.getItemAsync(savedPasswordKey, {
        requireAuthentication: false, // iOS เท่านั้น
      });
      if (savedPass) {
        setPassword(savedPass);
        setHasPass(true);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.main}>
        <SafeAreaView>
          <StatusBar barStyle="dark-content" backgroundColor={theme.white} />
        </SafeAreaView>

        <Image
          source={Assets.logoIStock}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.container}>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="gray" />
            <TextInput
              placeholder="username"
              value={username}
              onChangeText={(t) => {
                setUsername(t);
              }}
              style={styles.input}
              autoCapitalize="none"
              placeholderTextColor={theme.border}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="gray" />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
              }}
              style={styles.input}
              secureTextEntry={hidePassword}
              placeholderTextColor={theme.border}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
              <Ionicons
                name={hidePassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          {/* Remember me (checkbox) + Forgot password */}
          <View style={styles.rowBetween}>
            <Pressable
              style={styles.rememberRow}
              onPress={() => setRememberMe((v) => !v)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberMe }}
            >
              <Ionicons
                name={rememberMe ? "checkbox-outline" : "square-outline"}
                size={22}
                color={rememberMe ? theme.mainApp : theme.border}
              />
              <Text style={styles.rememberText}>จดจำฉัน</Text>
            </Pressable>

            <TouchableOpacity
              style={styles.textLinkRight}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.textLinkText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.registerText}>
            {"Don't have an account? "}
            <Text
              style={styles.registerLink}
              onPress={() => navigation.navigate("Register")}
            >
              Register
            </Text>
          </Text>

          <View style={{ marginTop: 24 }}>
            <CustomButton
              label={"Login"}
              onPress={handleLogin}
              isload={isload}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  main: {
    ...theme.setFont,
    flex: 1,
    padding: 24,
    backgroundColor: theme.white,
  },
  container: {
    ...theme.setFont,
    backgroundColor: theme.white,
  },
  logo: { width: 300, height: 250, alignSelf: "center", marginBottom: 32 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  input: { ...theme.setFont, flex: 1, marginLeft: 8 },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 8,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  rememberText: {
    ...theme.setFont,
    fontSize: 14,
  },
  textLinkRight: { paddingVertical: 4, paddingHorizontal: 4 },
  textLinkText: {
    ...theme.setFont,
    color: theme.mainApp,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
  },
  registerText: {
    ...theme.setFont,
    textAlign: "center",
    fontSize: 14,
    marginTop: 16,
  },
  registerLink: { color: theme.mainApp, fontWeight: "bold" },
});
