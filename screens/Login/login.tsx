import { Assets } from "@/assets/Assets";
import { useAuth } from "@/AuthContext";
import CustomButton from "@/components/CustomButton";
import { theme } from "@/providers/Theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const navigation = useNavigation<any>();
  const { login } = useAuth();

  const handleLogin = () => {
    const utf8Bytes = new TextEncoder().encode(password.toLowerCase());
    const base64Encoded = btoa(String.fromCharCode(...utf8Bytes));
    console.log("🔐 Encoded password:", base64Encoded);

    if (
      username.toLowerCase() === "admin" &&
      password.toLowerCase() === "1234"
    ) {
      login(); // ✅ เรียก Context ให้ Login สำเร็จ
    } else {
      Alert.alert("เข้าสู่ระบบล้มเหลว", "Username หรือ Password ไม่ถูกต้อง");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flex: 1 }}>
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
              onChangeText={setUsername}
              style={styles.input}
              autoCapitalize="none"
              placeholderTextColor={theme.border}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="gray" />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry={hidePassword}
              placeholderTextColor={theme.border}
            />
            <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
              <Ionicons
                name={hidePassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.textLink}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.textLinkText}>Forgot password?</Text>
          </TouchableOpacity>
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
            <CustomButton label={"Login"} onPress={handleLogin} />
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
    paddingVertical: 10,
    marginBottom: 16,
  },
  input: { ...theme.setFont, flex: 1, marginLeft: 8 },
  button: {
    ...theme.setFont,
    backgroundColor: theme.mainApp,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    ...theme.setFont,
    color: theme.white,
    textAlign: "center",
    fontSize: 16,
  },
  textLink: { marginTop: 16 },
  textLinkText: {
    ...theme.setFont,
    color: theme.mainApp,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
  },
  registerText: {
    ...theme.setFont,
    textAlign: "center",
    fontSize: 14,
    marginTop: 16,
  },
  registerLink: { color: theme.mainApp, fontWeight: "bold" },
});
